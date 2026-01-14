import axios from "axios";
import { supabase, isSupabaseConfigured } from "../../../lib/supabase";

export async function GET() {
    try {
        // Check if Supabase is configured
        if (!isSupabaseConfigured()) {
            return Response.json({
                error: "Supabase is niet geconfigureerd. Zet NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY in je environment variables.",
                details: "Deze variabelen moeten ingesteld zijn in Vercel Settings → Environment Variables."
            }, { status: 500 });
        }

        // 1. Haal producten op van Fake Store API
        const response = await axios.get("https://fakestoreapi.com/products");
        const products = response.data;

        // 2. Test Supabase verbinding eerst
        const { error: connectionError } = await supabase
            .from("producten")
            .select("id")
            .limit(1);

        if (connectionError) {
            // Check if error message contains HTML (Cloudflare error page)
            const errorMessage = connectionError.message || String(connectionError);
            if (errorMessage.includes('<!DOCTYPE html>') || errorMessage.includes('Web server is down') || errorMessage.includes('521')) {
                return Response.json({
                    error: "Supabase database is niet bereikbaar. Het project is waarschijnlijk gepauzeerd. Ga naar je Supabase dashboard en herstart het project.",
                    details: "Error 521: Web server is down. Dit gebeurt vaak wanneer een gratis Supabase project na inactiviteit wordt gepauzeerd."
                }, { status: 503 });
            }
            throw connectionError;
        }

        // 3. Voeg producten toe aan Supabase
        const { data, error } = await supabase
            .from("producten")
            .insert(products.map(p => ({
                title: p.title,
                price: p.price,
                description: p.description,
                image: p.image
            })))
            .select("*");

        if (error) {
            // Check if error is a connection error
            const errorMessage = error.message || String(error);
            if (errorMessage.includes('<!DOCTYPE html>') || errorMessage.includes('Web server is down') || errorMessage.includes('521')) {
                return Response.json({
                    error: "Supabase database is niet bereikbaar. Het project is waarschijnlijk gepauzeerd. Ga naar je Supabase dashboard en herstart het project.",
                    details: "Error 521: Web server is down. Dit gebeurt vaak wanneer een gratis Supabase project na inactiviteit wordt gepauzeerd."
                }, { status: 503 });
            }
            throw error;
        }

        return Response.json({ message: "Data toegevoegd!", inserted: data?.length ?? 0, sample: data?.slice(0, 2) ?? [] });
    } catch (err) {
        console.error(err);

        // Check if error response contains HTML (Cloudflare error)
        const errorMessage = err.message || String(err);
        if (errorMessage.includes('<!DOCTYPE html>') || errorMessage.includes('Web server is down') || errorMessage.includes('521')) {
            return Response.json({
                error: "Supabase database is niet bereikbaar. Het project is waarschijnlijk gepauzeerd. Ga naar je Supabase dashboard en herstart het project.",
                details: "Error 521: Web server is down. Dit gebeurt vaak wanneer een gratis Supabase project na inactiviteit wordt gepauzeerd."
            }, { status: 503 });
        }

        return Response.json({
            error: err.message || "Onbekende fout opgetreden",
            details: err.toString()
        }, { status: 500 });
    }
}
