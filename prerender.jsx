import React from "react";
import ReactDOMServer from "react-dom/server";
import { MemoryRouter } from "react-router";
import HomePage from "@/pages/Home";

export async function prerender() {
  const html = ReactDOMServer.renderToString(
    <MemoryRouter initialEntries={["/"]}>
      <HomePage />
    </MemoryRouter>
  );

  return { html };
}
