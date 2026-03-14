"use client";
import { WipPage } from "@/app/(public)/wip/page";

import { useEffect, useState } from "react";

import { packageService } from "@/services/firebase";
import { Package } from "@/types";

import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2, X } from "lucide-react";

export default function SalesPage() {
    return (
        <div className="p-6">
            <WipPage />
        </div>
    );
}
