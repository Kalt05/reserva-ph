"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { QRCodeSVG } from "qrcode.react"
import { v4 as uuidv4 } from "uuid"
import { motion } from "framer-motion"
import { CalendarIcon, PhoneIcon, UserIcon, ShieldIcon, InfoIcon, MailIcon, CameraIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("es-ES", { year: "numeric", month: "2-digit", day: "2-digit" })
}

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
      fecha: new Date(formData.get("fecha") as string).toISOString().split("T")[0], // Store as YYYY-MM-DD
      telefono: formData.get("telefono"),
      token: uuidv4(),
      timestamp: new Date().toISOString(),
      status: "pendiente",
    }

    // Store in localStorage (simulating a database)
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="mx-auto max-w-2xl bg-gray-800 text-gray-100 border-gray-700">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-blue-400">Reservación de Transporte</CardTitle>
            <CardDescription className="text-center text-gray-400">
              Destino La Habana desde provincia Granma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showQR ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG value={bookingToken} size={200} />
                </div>
                <p className="text-sm text-gray-400 text-center">
                  Este es su código QR de reserva. Por favor, guárdelo y muéstrelo al abordar.
                </p>
                <p className="text-xs text-gray-500">Token: {bookingToken}</p>
                <p className="text-xs text-gray-500">
                  Fecha de reserva: {formatDate(new Date().toISOString().split("T")[0])}
                </p>
                <div className="flex items-center text-yellow-400 bg-yellow-400/20 p-3 rounded-md">
                  <CameraIcon className="h-5 w-5 mr-2" />
                  <span className="text-sm">Importante: Haga una captura de pantalla de este QR para no perderlo.</span>
                </div>
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
                    <Label htmlFor="nombre" className="text-gray-300">
                      Nombre de la Persona
                    </Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="nombre"
                        name="nombre"
                        required
                        className="pl-9 bg-gray-700 text-gray-100 border-gray-600"
                        placeholder="Ingrese su nombre completo"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="ci" className="text-gray-300">
                      Número de C.I.
                    </Label>
                    <Input
                      id="ci"
                      name="ci"
                      required
                      placeholder="Ingrese su número de identidad"
                      className="bg-gray-700 text-gray-100 border-gray-600"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="destino" className="text-gray-300">
                      Destino
                    </Label>
                    <Select name="destino" required>
                      <SelectTrigger className="bg-gray-700 text-gray-100 border-gray-600">
                        <SelectValue placeholder="Seleccione un destino" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Habana">Habana</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="municipio" className="text-gray-300">
                      Municipio
                    </Label>
                    <Select name="municipio" required>
                      <SelectTrigger className="bg-gray-700 text-gray-100 border-gray-600">
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
                    <Label htmlFor="omnibus" className="text-gray-300">
                      Tipo de ómnibus
                    </Label>
                    <Select name="omnibus" required>
                      <SelectTrigger className="bg-gray-700 text-gray-100 border-gray-600">
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
                    <Label htmlFor="fecha" className="text-gray-300">
                      Fecha de Reservación
                    </Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        type="date"
                        id="fecha"
                        name="fecha"
                        required
                        className="pl-9 bg-gray-700 text-gray-100 border-gray-600"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="telefono" className="text-gray-300">
                      Número de Teléfono
                    </Label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        required
                        className="pl-9 bg-gray-700 text-gray-100 border-gray-600"
                        placeholder="+53 5 123 4567"
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  {loading ? "Procesando..." : "Realizar Reservación"}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center pt-6 space-x-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600"
                >
                  <InfoIcon className="h-4 w-4" />
                  Instrucciones
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 text-gray-100 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-blue-400">Instrucciones de Uso</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Complete el formulario con sus datos personales y detalles del viaje.</li>
                      <li>Seleccione la fecha de reservación deseada.</li>
                      <li>Haga clic en "Realizar Reservación" para generar su código QR.</li>
                      <li>Capture una imagen del código QR generado o guárdelo en su dispositivo.</li>
                      <li>Presente el código QR al abordar el ómnibus en la fecha de su viaje.</li>
                    </ol>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600"
                >
                  <MailIcon className="h-4 w-4" />
                  Contactar Admin
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 text-gray-100 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-blue-400">Contacto del Administrador</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    <p className="mb-4">
                      Para cualquier consulta o problema, puede contactar al administrador a través de:
                    </p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Email: admin@reservaplus.com</li>
                      <li>Teléfono: +53 5 555 5555</li>
                      <li>Horario de atención: Lunes a Viernes, 9:00 AM - 5:00 PM</li>
                    </ul>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              className="flex items-center gap-2 bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600"
              asChild
            >
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

