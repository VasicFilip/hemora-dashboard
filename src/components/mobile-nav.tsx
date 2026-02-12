"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { HemoraLogo } from "@/components/HemoraLogo"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

export function MobileNav() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="lg:hidden flex items-center justify-between h-16 px-6 border-b bg-white/80 dark:bg-black/35 backdrop-blur-[16px] border-black/10 dark:border-white/20 sticky top-0 z-50 shadow-sm dark:shadow-black/40 dark:[box-shadow:0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)]">
            <HemoraLogo size="md" showText={true} />

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                    <SheetHeader className="sr-only">
                        <SheetTitle>Navigation Menu</SheetTitle>
                    </SheetHeader>
                    <div className="flex h-full flex-col">
                        <div className="flex h-16 items-center border-b px-6">
                            <HemoraLogo size="lg" showText={true} />
                        </div>
                        <div className="flex-1 overflow-y-auto" onClick={() => setIsOpen(false)}>
                            <Sidebar isMobile className="border-none" />
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
