import { auth } from "./lib/auth";
import { headers } from "next/headers";

export async function debugAuth() {
    console.log("Checking Better-Auth instance API...");
    console.log("auth.api keys:", Object.keys(auth.api));
    
    if (auth.api.createUser) {
        console.log("Admin methods (like createUser) are detected on auth.api");
    } else {
        console.log("Admin methods are NOT detected on auth.api");
    }
}
