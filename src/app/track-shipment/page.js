import TrackShipmentComponent from '@/components/HomeComponents/TrackShipmentComponent'
import React, { Suspense } from 'react'

export default function TrackShipment() {
  return (
    <Suspense fallback={<div className="bg-gray-50 py-16 px-4"><div className="container mx-auto text-center">Loading...</div></div>}>
        <TrackShipmentComponent />
    </Suspense>
  )
}
