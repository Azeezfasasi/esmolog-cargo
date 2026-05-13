// components/InvoiceDocument.jsx
import React from 'react';
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12 },
  section: { marginBottom: 10 },
  header: { fontSize: 18, marginBottom: 10, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label: { fontWeight: 'bold' },
});

const InvoiceDocument = ({ shipment }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Shipment Invoice</Text>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Tracking Number:</Text>
          <Text>{shipment.trackingNumber}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Sender:</Text>
          <Text>{shipment.senderName} ({shipment.senderEmail})</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Receiver:</Text>
          <Text>{shipment.receiverName} ({shipment.receiverPhone})</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Origin:</Text>
          <Text>{shipment.origin}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Destination:</Text>
          <Text>{shipment.destination}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Weight:</Text>
          <Text>{shipment.weight} kg</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text>{shipment.status}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Created At:</Text>
          <Text>{new Date(shipment.createdAt).toLocaleDateString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Description:</Text>
          <Text>{shipment.description || 'N/A'}</Text>
        </View>
      </View>

      <Text>Thank you for using our shipping service!</Text>
    </Page>
  </Document>
);

export default InvoiceDocument;
