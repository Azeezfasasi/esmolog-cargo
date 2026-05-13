import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoiceDocument from './InvoiceDocument';

export default function InvoiceModal({ open, onClose, shipment }) {
  if (!shipment) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogTitle>Generate Invoice</DialogTitle>
      <DialogContent>
        <p>You can download a PDF invoice for this shipment.</p>
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <PDFDownloadLink
          document={<InvoiceDocument shipment={shipment} />}
          fileName={`invoice_${shipment.trackingNumber || shipment._id}.pdf`}
        >
          {({ loading }) =>
            loading ? (
              <Button disabled>Generating...</Button>
            ) : (
              <Button>Download Invoice</Button>
            )
          }
        </PDFDownloadLink>
      </DialogFooter>
    </Dialog>
  );
}
