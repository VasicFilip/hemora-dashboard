"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, Activity } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
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
        <div className="lg:hidden flex items-center justify-between h-16 px-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                    <Activity className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold">hemora.ch</span>
            </div>

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
                            <div className="flex items-center space-x-2">
                                <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                                    <Activity className="h-4 w-4 text-primary-foreground" />
                                </div>
                                <span className="text-lg font-semibold">hemora.ch</span>
                            </div>
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
