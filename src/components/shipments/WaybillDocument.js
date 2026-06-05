// components/WaybillDocument.jsx
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12 },
  header: { fontSize: 18, textAlign: 'center', marginBottom: 20 },
  section: { marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label: { fontWeight: 'bold' },
  borderBox: {
    border: '1pt solid #000',
    padding: 10,
    marginBottom: 10,
  },
});

const WaybillDocument = ({ shipment }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Waybill</Text>

      <View style={styles.borderBox}>
        <Text style={{ fontSize: 14, marginBottom: 5 }}>Sender Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Name:</Text>
          <Text>{shipment.senderName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text>{shipment.senderEmail}</Text>
        </View>
      </View>

      <View style={styles.borderBox}>
        <Text style={{ fontSize: 14, marginBottom: 5 }}>Receiver Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Name:</Text>
          <Text>{shipment.receiverName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phone:</Text>
          <Text>{shipment.receiverPhone}</Text>
        </View>
      </View>

      <View style={styles.borderBox}>
        <Text style={{ fontSize: 14, marginBottom: 5 }}>Shipment Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Tracking No.:</Text>
          <Text>{shipment.trackingNumber}</Text>
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
      </View>

      <Text>Generated on: {new Date(shipment.createdAt).toLocaleString()}</Text>
      <Text style={{ marginTop: 20 }}>Signature: ___________________________</Text>
    </Page>
  </Document>
);

export default WaybillDocument;
