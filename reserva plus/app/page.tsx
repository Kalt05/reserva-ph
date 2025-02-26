"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { QRCodeSVG } from "qrcode.react"
import { v4 as uuidv4 } from "uuid"
import { motion } from "framer-motion"
import { CalendarIcon, PhoneIcon, UserIcon, ShieldIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

export default function BookingForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [bookingToken, setBookingToken] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      nombre: formData.get("nombre"),
      ci: formData.get("ci"),
      destino: formData.get("destino"),
      municipio: formData.get("municipio"),
      omnibus: formData.get("omnibus"),
      fecha: formData.get("fecha"),
      telefono: formData.get("telefono"),
      token: uuidv4(),
      timestamp: new Date().toISOString(),
      status: "pendiente", // Add status field
    }

    // Store in localStorage
    const existingBookings = JSON.parse(localStorage.getItem("bookings") || "[]")
    localStorage.setItem("bookings", JSON.stringify([...existingBookings, data]))

    setBookingToken(data.token)
    setShowQR(true)
    setLoading(false)

    toast({
      title: "Reservación exitosa",
      description: "Se ha generado su código QR de reserva",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-blue-200 p-4 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Reservación de Transporte</CardTitle>
            <CardDescription className="text-center">Destino La Habana desde provincia Granma</CardDescription>
          </CardHeader>
          <CardContent>
            {/* ... existing form content ... */}
            {showQR ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG value={bookingToken} size={200} />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Este es su código QR de reserva. Por favor, guárdelo y muéstrelo al abordar.
                </p>
                <p className="text-xs text-gray-500">Token: {bookingToken}</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowQR(false)
                    router.refresh()
                  }}
                >
                  Nueva Reservación
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nombre">Nombre de la Persona</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="nombre"
                        name="nombre"
                        required
                        className="pl-9"
                        placeholder="Ingrese su nombre completo"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="ci">Número de C.I.</Label>
                    <Input id="ci" name="ci" required placeholder="Ingrese su número de identidad" />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="destino">Destino</Label>
                    <Select name="destino" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un destino" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Habana">Habana</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="municipio">Municipio</Label>
                    <Select name="municipio" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un municipio" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Niquero",
                          "Pilón",
                          "Media Luna",
                          "Campechuela",
                          "Manzanillo",
                          "Yara",
                          "Veguita",
                          "Bayamo",
                          "Jiguani",
                          "Río Cauto",
                          "Cauto Cristo",
                        ].map((municipio) => (
                          <SelectItem key={municipio} value={municipio}>
                            {municipio}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="omnibus">Tipo de ómnibus</Label>
                    <Select name="omnibus" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione el tipo de ómnibus" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yutong">Yutong</SelectItem>
                        <SelectItem value="Volvo">Volvo</SelectItem>
                        <SelectItem value="Diana">Diana</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="fecha">Fecha de Reservación</Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input type="date" id="fecha" name="fecha" required className="pl-9" />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="telefono">Número de Teléfono</Label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        required
                        className="pl-9"
                        placeholder="+53 5 123 4567"
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Procesando..." : "Realizar Reservación"}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center pt-6">
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <Link href="/admin">
                <ShieldIcon className="h-4 w-4" />
                Acceso Administrativo
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

