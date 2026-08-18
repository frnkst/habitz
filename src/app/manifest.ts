import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Habitz",
    short_name: "Habitz",
    description: "A simple, private habit tracker.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f3ff",
    theme_color: "#f7f3ff",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
