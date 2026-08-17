import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Habitz",
    short_name: "Habitz",
    description: "A simple, private habit tracker.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f1fb",
    theme_color: "#f4f1fb",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
