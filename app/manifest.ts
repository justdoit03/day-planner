import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ясно — AI-планер дня",
    short_name: "Ясно",
    description:
      "Скажи, що в голові — AI розкладе все по поличках і збере план на сьогодні",
    start_url: "/",
    display: "standalone",
    background_color: "#eceef1",
    theme_color: "#eceef1",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
