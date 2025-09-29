import axios from "axios";
import { supabase } from "../../../lib/supabase";

export async function GET() {
    try {
        // 1. Haal producten op van Fake Store API
        const response = await axios.get("https://fakestoreapi.com/products");
        const products = response.data;

        // 2. Voeg producten toe aan Supabase
        const { data, error } = await supabase
            .from("producten")
            .insert(products.map(p => ({
                title: p.title,
                price: p.price,
                description: p.description,
                image: p.image
            })))
            .select("*");

        if (error) throw error;

        return Response.json({ message: "Data toegevoegd!", inserted: data?.length ?? 0, sample: data?.slice(0, 2) ?? [] });
    } catch (err) {
        console.error(err);
        return Response.json({ error: err.message }, { status: 500 });
    }
}
