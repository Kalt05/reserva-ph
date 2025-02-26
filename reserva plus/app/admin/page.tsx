"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { QrScanner } from "@yudiel/react-qr-scanner"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

type Booking = {
  nombre: string
  ci: string
  destino: string
  municipio: string
  omnibus: string
  fecha: string
  telefono: string
  token: string
  timestamp: string
  status: "pendiente" | "verificado" | "usado"
}

export default function AdminPanel() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [scannerDialog, setScannerDialog] = useState(false)
  const [lastScannedBooking, setLastScannedBooking] = useState<Booking | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Check if admin is logged in
    const adminToken = localStorage.getItem("adminToken")
    if (adminToken === "admin-session-token") {
      setIsLoggedIn(true)
      loadBookings()
    }
  }, [])

  const loadBookings = () => {
    const stored = localStorage.getItem("bookings")
    setBookings(stored ? JSON.parse(stored) : [])
  }

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const username = formData.get("username")
    const password = formData.get("password")

    if (username === "admin" && password === "admin") {
      localStorage.setItem("adminToken", "admin-session-token")
      setIsLoggedIn(true)
      loadBookings()
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al panel de administración",
      })
    } else {
      toast({
        title: "Error de autenticación",
        description: "Usuario o contraseña incorrectos",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    setIsLoggedIn(false)
    router.push("/")
  }

  const handleScan = (data: string | null) => {
    if (data) {
      const booking = bookings.find((b) => b.token === data)
      if (booking) {
        setLastScannedBooking(booking)
        setScannerDialog(true)

        // Update booking status
        const updatedBookings = bookings.map((b) => (b.token === data ? { ...b, status: "verificado" as const } : b))
        localStorage.setItem("bookings", JSON.stringify(updatedBookings))
        setBookings(updatedBookings)

        toast({
          title: "Reserva válida",
          description: `Reserva encontrada para ${booking.nombre}`,
        })
      } else {
        toast({
          title: "Reserva inválida",
          description: "No se encontró la reserva",
          variant: "destructive",
        })
      }
      setShowScanner(false)
    }
  }

  const getStatusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "pendiente":
        return <Badge variant="secondary">Pendiente</Badge>
      case "verificado":
        return <Badge variant="success">Verificado</Badge>
      case "usado":
        return <Badge variant="default">Usado</Badge>
      default:
        return null
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardHeader>
              <CardTitle>Panel de Administración</CardTitle>
              <CardDescription>Inicie sesión para continuar</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Usuario</Label>
                  <Input id="username" name="username" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                <div className="flex flex-col gap-2">
                  <Button type="submit">Iniciar Sesión</Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => router.push("/")}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Volver
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Panel de Administración</CardTitle>
              <CardDescription>Gestión de reservaciones</CardDescription>
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setShowScanner((prev) => !prev)}>
                {showScanner ? "Cerrar Scanner" : "Escanear QR"}
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showScanner ? (
            <div className="max-w-md mx-auto">
              <QrScanner onDecode={handleScan} onError={(error) => console.log(error?.message)} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>C.I.</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Municipio</TableHead>
                    <TableHead>Ómnibus</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking, index) => (
                    <TableRow key={index}>
                      <TableCell>{booking.nombre}</TableCell>
                      <TableCell>{booking.ci}</TableCell>
                      <TableCell>{booking.destino}</TableCell>
                      <TableCell>{booking.municipio}</TableCell>
                      <TableCell>{booking.omnibus}</TableCell>
                      <TableCell>{booking.fecha}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={scannerDialog} onOpenChange={setScannerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resultado de la verificación</DialogTitle>
            <DialogDescription>
              {lastScannedBooking && (
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-2">
                    {lastScannedBooking.status === "verificado" ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      {lastScannedBooking.status === "verificado" ? "Reserva válida" : "Reserva inválida"}
                    </span>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <div>
                      <span className="font-medium">Nombre:</span> {lastScannedBooking.nombre}
                    </div>
                    <div>
                      <span className="font-medium">C.I.:</span> {lastScannedBooking.ci}
                    </div>
                    <div>
                      <span className="font-medium">Destino:</span> {lastScannedBooking.destino}
                    </div>
                    <div>
                      <span className="font-medium">Fecha:</span> {lastScannedBooking.fecha}
                    </div>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}

