'use client';

import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PDFDownloadLink } from '@react-pdf/renderer';
import WaybillDocument from './WaybillDocument';

export default function WaybillModal({ open, onClose, shipment }) {
  if (!shipment) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogTitle>Generate Waybill</DialogTitle>
      <DialogContent>
        <p>You can download a PDF waybill for this shipment.</p>
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <PDFDownloadLink
          document={<WaybillDocument shipment={shipment} />}
          fileName={`waybill_${shipment.trackingNumber || shipment._id}.pdf`}
        >
          {({ loading }) =>
            loading ? (
              <Button disabled>Generating...</Button>
            ) : (
              <Button>Download Waybill</Button>
            )
          }
        </PDFDownloadLink>
      </DialogFooter>
    </Dialog>
  );
}
