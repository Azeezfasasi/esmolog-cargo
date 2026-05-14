'use client';

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import ShipmentTable from '../shipments/ShipmentTable';
import ShipmentToolbar from '../shipments/ShipmentToolbar';
import EditShipmentModal from '../shipments/EditShipmentModal';
import ReplyModal from '../shipments/ReplyModal';
import ChangeStatusModal from '../shipments/ChangeStatusModal';
import PrintModal from '../shipments/PrintModal';
import { exportToExcel } from '../../utils/exportToExcel';
import { API_BASE_URL } from '@/config/Api';
import BasicModal from '@/components/ui/BasicModal';
import DeleteConfirmationModal from '../shipments/DeleteConfirmationModal';
import { FaSpinner } from 'react-icons/fa';
import DeliveredShipmentTable from '../shipments/DeliveredShipmentTable';

export default function DeliveredShipmentsMain({ token }) {
  const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getTimestamp = (item) => {
    return new Date(
      item.createdAt ||
      item.shipmentDate ||
      item.timestamp ||
      item.dateCreated ||
      item.updatedAt || // fallback
      0 // default if none found
    );
  };

  // Centralized filter application (pure function - no hook deps)
  const applyFilters = ({ shipmentsList, status, facility, term } = {}) => {
    const list = Array.isArray(shipmentsList) ? shipmentsList : [];
    const q = (term || '').toLowerCase();
    return list.filter((s) => {
      const matchesStatus = !status || s.status === status;
      const facilityName = (s.shipmentFacility || s.shipmentfacility || s.facility || '').toString();
      const matchesFacility = !facility || facilityName === facility;
      const matchesSearch = !q || (
        s.trackingNumber?.toLowerCase().includes(q) ||
        s.senderName?.toLowerCase().includes(q) ||
        s.destination?.toLowerCase().includes(q) ||
        s.status?.toLowerCase().includes(q)
      );
      return matchesStatus && matchesFacility && matchesSearch;
    });
  };

  const fetchShipments = useCallback(async () => {
    setLoading(true); // Start loading
    setError(null);
    try {
      const authToken = token || localStorage.getItem('token');
      console.log('AllShipmentsMain: fetching shipments, token present?', !!authToken);
      const res = await axios.get(`${API_BASE_URL}/shipments`, authToken ? {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      } : undefined);
      console.log('AllShipmentsMain: fetch response status', res.status);
      const sorted = Array.isArray(res.data) ? res.data.sort((a, b) => getTimestamp(b) - getTimestamp(a)) : [];
      console.log('AllShipmentsMain: fetched shipments count', sorted.length);
      setShipments(sorted);
      // apply current filters to freshly fetched data using current UI state
      const applied = applyFilters({ shipmentsList: sorted, status: selectedStatus, facility: selectedFacility, term: searchQuery });
      setFilteredShipments(applied);
    } catch (err) {
      console.error('Failed to fetch shipments:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to fetch shipments');
      setShipments([]);
      setFilteredShipments([]);
    } finally {
      setLoading(false); // Stop loading
    }
  }, [token, selectedStatus, selectedFacility, searchQuery]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  // compute facility counts from shipments
  const facilities = React.useMemo(() => {
    const map = {};
    shipments.forEach((s) => {
      const raw = (s.shipmentFacility || s.shipmentfacility || s.facility || '').toString();
      const name = raw.trim();
      if (!name) return;
      map[name] = (map[name] || 0) + 1;
    });
    // turn into array, preserving some static ordering for known facilities
    const knownOrder = [
      'Atlanta','Indianapolis','New York','New jersey','Maryland','Dallas','Houston','United States of America','Canada','Ontario','Calgary','Edmonton','United Kingdom'
    ];
    const result = [];
    knownOrder.forEach((k) => {
      if (map[k]) result.push({ name: k, count: map[k] });
    });
    // add any other facilities discovered
    Object.keys(map).forEach((k) => {
      if (!knownOrder.includes(k)) result.push({ name: k, count: map[k] });
    });
    return result;
  }, [shipments]);

  const handleSearch = (searchTerm) => {
    setSearchQuery(searchTerm);
    const applied = applyFilters({ term: searchTerm });
    setFilteredShipments(applied);
  };


  const handleFilter = (status) => {
    setSelectedStatus(status);
    const applied = applyFilters({ status });
    setFilteredShipments(applied);
  };

  const handleFacilityChange = (facility) => {
    setSelectedFacility(facility);
    const applied = applyFilters({ facility });
    setFilteredShipments(applied);
  };

  const openModal = (shipment, type) => {
    setSelectedShipment(shipment);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedShipment(null);
    setModalType(null);
  };

    const handleDeleteShipment = async (id) => {
    console.log("Trying to delete shipment:", id);
      try {
        const res = await axios.delete(`${API_BASE_URL}/shipments/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Delete success:", res.data);
        fetchShipments();
      } catch (err) {
        console.error("Delete failed:", err.response?.data || err.message);
      }
    };

    const handleSendReply = async ({ shipmentId, message }) => {
    try {
        const token = localStorage.getItem("token");
        await axios.post(`${API_BASE_URL}/shipments/${shipmentId}/reply`, 
        { message },
        {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        }
        );
        // Optionally show a toast or refetch shipment notes/messages
        console.log("Reply sent successfully");
    } catch (error) {
        console.error("Error sending reply:", error);
    }
    };

    const handleStatusChange = async ({ shipmentId, newStatus, location }) => {
        try {
            await axios.patch(`${API_BASE_URL}/shipments/${shipmentId}/status`, { 
              status: newStatus,
              location: location
            }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            });
            await fetchShipments(); 
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };
    
    if (loading) { 
        return (
          <section className="py-8 sm:py-12 bg-gray-50 font-inter antialiased flex items-center justify-center min-h-[calc(100vh-120px)]">
            <FaSpinner className="animate-spin text-green-600 text-4xl" />
            <p className="ml-3 text-lg text-gray-700">Loading all shipments...</p>
          </section>
        );
      }

  if (error) {
    return (
      <section className="py-8 sm:py-12 bg-gray-50 font-inter antialiased flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
        <p className="text-red-600 mb-4">Error loading shipments: {String(error)}</p>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded"
          onClick={() => fetchShipments()}
        >
          Retry
        </button>
      </section>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 w-full">
      <div className='font-bold text-[18px] sm:text-[20px] md:text-[28px]'>Delivered Shipments</div>
      {/* Toolbar and Filters */}
      <ShipmentToolbar
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onStatusChange={handleFilter}
        onFacilityChange={handleFacilityChange}
        selectedFacility={selectedFacility}
        facilities={facilities}
        onExport={() => exportToExcel(filteredShipments, 'All_Shipments')}
      />


      {/* Table */}
      <DeliveredShipmentTable
        shipments={filteredShipments}
        onActionClick={openModal}
        onDeleteClick={(shipment) => openModal(shipment, 'delete')}
      />

        {/* Modals */}
        {selectedShipment && (
          <BasicModal isOpen={modalType === 'delete'} onClose={closeModal}>
            <DeleteConfirmationModal
              isOpen={modalType === 'delete'}
              shipment={selectedShipment}
              onClose={closeModal}
              onConfirm={handleDeleteShipment}
            />
          </BasicModal>
        )}

        {selectedShipment && (
        <BasicModal isOpen={modalType === 'edit'} onClose={closeModal}>
            <EditShipmentModal
                shipment={selectedShipment}
                onClose={closeModal}
                onUpdate={fetchShipments}
                onSave={async (updatedShipment) => {
                try {
                    await axios.put(`${API_BASE_URL}/shipments/${updatedShipment._id}`, updatedShipment, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    });
                    fetchShipments(); // Refresh data
                } catch (error) {
                    console.error('Failed to update shipment:', error);
                }
                }}
            />
        </BasicModal>
        )}

        {selectedShipment && (
        <BasicModal isOpen={modalType === 'reply'} onClose={closeModal}>
            <ReplyModal
            shipment={selectedShipment}
            onSendReply={handleSendReply}
            onClose={closeModal}
            />
        </BasicModal>
        )}

        {selectedShipment && (
        <BasicModal isOpen={modalType === 'status'} onClose={closeModal}>
          <ChangeStatusModal
          shipment={selectedShipment}
          onClose={() => closeModal(false)}
          onStatusChange={handleStatusChange}
          />
        </BasicModal>
        )}

        {selectedShipment && (
        <BasicModal isOpen={modalType === 'print'} onClose={closeModal}>
            <PrintModal shipment={selectedShipment} onClose={closeModal} />
        </BasicModal>
        )}
    </div>
  );
}
