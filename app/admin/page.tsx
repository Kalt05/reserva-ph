"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { BrowserQRCodeReader } from "@zxing/library"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle, XCircle, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
  const [qrCodeReader, setQrCodeReader] = useState<BrowserQRCodeReader | null>(null)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null)

  useEffect(() => {
    // Check if admin is logged in
    const adminToken = localStorage.getItem("adminToken")
    if (adminToken === "admin-session-token") {
      setIsLoggedIn(true)
      loadBookings()
    }

    // Initialize QR Code Reader
    setQrCodeReader(new BrowserQRCodeReader())
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

    if (username === "0000" && password === "0000") {
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

  const handleError = (err: any) => {
    console.error(err)
    toast({
      title: "Error en el escaneo",
      description: "Hubo un problema al escanear el código QR",
      variant: "destructive",
    })
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

  const startScanning = useCallback(async () => {
    if (!qrCodeReader) return

    try {
      const videoInputDevices = await qrCodeReader.getVideoInputDevices()

      if (videoInputDevices.length === 0) {
        toast({
          title: "Error",
          description: "No se encontraron cámaras disponibles.",
          variant: "destructive",
        })
        return
      }

      qrCodeReader
        .decodeFromInputVideoDevice(videoInputDevices[0].deviceId, "video")
        .then((result) => {
          handleScan(result.getText())
        })
        .catch((err) => {
          handleError(err)
        })
    } catch (error) {
      handleError(error)
    }
  }, [qrCodeReader, handleScan, handleError, toast])

  const stopScanning = useCallback(() => {
    if (qrCodeReader) {
      qrCodeReader.reset()
    }
  }, [qrCodeReader])

  useEffect(() => {
    if (showScanner) {
      startScanning()
    } else {
      stopScanning()
    }

    return () => {
      stopScanning()
    }
  }, [showScanner, startScanning, stopScanning])

  const handleDeleteBooking = (booking: Booking) => {
    setBookingToDelete(booking)
    setDeleteDialog(true)
  }

  const confirmDeleteBooking = () => {
    if (bookingToDelete) {
      const updatedBookings = bookings.filter((b) => b.token !== bookingToDelete.token)
      localStorage.setItem("bookings", JSON.stringify(updatedBookings))
      setBookings(updatedBookings)
      setDeleteDialog(false)
      setBookingToDelete(null)
      toast({
        title: "Reserva eliminada",
        description: `La reserva de ${bookingToDelete.nombre} ha sido eliminada`,
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", { year: "numeric", month: "2-digit", day: "2-digit" })
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="bg-gray-800 text-gray-100 border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-blue-400">Panel de Administración</CardTitle>
              <CardDescription className="text-gray-400">Inicie sesión para continuar</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-300">
                    Usuario
                  </Label>
                  <Input id="username" name="username" required className="bg-gray-700 text-gray-100 border-gray-600" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="bg-gray-700 text-gray-100 border-gray-600"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Iniciar Sesión
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => router.push("/")}
                    className="flex items-center gap-2 bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600"
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      <Card className="bg-gray-800 text-gray-100 border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-blue-400">Panel de Administración</CardTitle>
              <CardDescription className="text-gray-400">Gestión de reservaciones</CardDescription>
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowScanner((prev) => !prev)}
                className="bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600"
              >
                {showScanner ? "Cerrar Scanner" : "Escanear QR"}
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600"
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showScanner ? (
            <div className="max-w-md mx-auto">
              <video id="video" width="100%" height="240" style={{ border: "1px solid gray" }}></video>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Nombre</TableHead>
                    <TableHead className="text-gray-300">C.I.</TableHead>
                    <TableHead className="text-gray-300">Destino</TableHead>
                    <TableHead className="text-gray-300">Municipio</TableHead>
                    <TableHead className="text-gray-300">Ómnibus</TableHead>
                    <TableHead className="text-gray-300">Fecha</TableHead>
                    <TableHead className="text-gray-300">Estado</TableHead>
                    <TableHead className="text-gray-300">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking, index) => (
                    <TableRow key={index} className="border-gray-700">
                      <TableCell className="text-gray-300">{booking.nombre}</TableCell>
                      <TableCell className="text-gray-300">{booking.ci}</TableCell>
                      <TableCell className="text-gray-300">{booking.destino}</TableCell>
                      <TableCell className="text-gray-300">{booking.municipio}</TableCell>
                      <TableCell className="text-gray-300">{booking.omnibus}</TableCell>
                      <TableCell className="text-gray-300">{formatDate(booking.fecha)}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteBooking(booking)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={scannerDialog} onOpenChange={setScannerDialog}>
        <DialogContent className="bg-gray-800 text-gray-100 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-blue-400">Resultado de la verificación</DialogTitle>
          </DialogHeader>
          {lastScannedBooking && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                {lastScannedBooking.status === "verificado" ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium text-gray-300">
                  {lastScannedBooking.status === "verificado" ? "Reserva válida" : "Reserva inválida"}
                </span>
              </div>
              <dl className="grid gap-2 text-sm">
                <div>
                  <dt className="font-medium text-gray-300 inline">Nombre:</dt>{" "}
                  <dd className="text-gray-400 inline">{lastScannedBooking.nombre}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-300 inline">C.I.:</dt>{" "}
                  <dd className="text-gray-400 inline">{lastScannedBooking.ci}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-300 inline">Destino:</dt>{" "}
                  <dd className="text-gray-400 inline">{lastScannedBooking.destino}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-300 inline">Fecha:</dt>{" "}
                  <dd className="text-gray-400 inline">{formatDate(lastScannedBooking.fecha)}</dd>
                </div>
              </dl>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="bg-gray-800 text-gray-100 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-blue-400">Confirmar eliminación</DialogTitle>
            <DialogDescription className="text-gray-400">
              ¿Está seguro de que desea eliminar esta reserva? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog(false)}
              className="bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600"
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteBooking} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

