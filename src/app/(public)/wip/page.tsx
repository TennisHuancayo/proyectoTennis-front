"use client";

import { useEffect, useState } from "react";

export function WipPage() {

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="w-lg h-lg flex flex-col items-center justify-center p-4 font-sans">

                <div className="mb-6 flex justify-center w-1/2">
                    <img
                        src="/images/news/WIP-page/wip-cat.svg"
                        alt="Gatito tierno"
                    />
                </div>

                <h1 className="text-3xl text-center font-bold text-gray-800 mb-2">
                    ¡Estamos trabajando en algo nuevo!
                </h1>
                <p className="text-gray-600 mb-6">
                    Nuestra página está actualmente en construcción. Regresa pronto para ver las novedades.
                </p>

                <footer className="mt-8 text-gray-400 text-sm">
                    © 2026 Todos los derechos reservados.
                </footer>
            </div>
        </div>

    );
}
