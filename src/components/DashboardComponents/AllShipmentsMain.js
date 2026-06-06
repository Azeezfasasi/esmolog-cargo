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

export default function AllShipmentsMain({ token }) {
  const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [statuses, setStatuses] = useState([]);

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

  // Fetch facilities and statuses on mount
  useEffect(() => {
    const fetchFacilitiesAndStatuses = async () => {
      try {
        const [facilitiesRes, statusesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/facilities`),
          axios.get(`${API_BASE_URL}/shipment-statuses`)
        ]);
        
        // Transform facilities for display
        const facilityList = (Array.isArray(facilitiesRes.data) ? facilitiesRes.data : facilitiesRes.data?.data || []).map(f => ({
          name: f.name,
          count: 0 // Will be calculated from shipments
        }));
        setFacilities(facilityList);
        
        // Set statuses - handle both array and object response
        const statusesData = Array.isArray(statusesRes.data) ? statusesRes.data : (statusesRes.data?.data || []);
        // console.log('Fetched statuses:', statusesData);
        setStatuses(statusesData);
      } catch (err) {
        console.error('Error fetching facilities/statuses:', err);
        setStatuses([]);
      }
    };
    
    fetchFacilitiesAndStatuses();
  }, []);

  // Centralized filter application (pure function - no hook deps)
  const applyFilters = ({ shipmentsList, status, facility, term } = {}) => {
    const list = Array.isArray(shipmentsList) ? shipmentsList : [];
    const q = (term || '').toLowerCase();
    return list.filter((s) => {
      const matchesStatus = !status || s.status?.toLowerCase() === status.toLowerCase();
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
      // console.log('AllShipmentsMain: fetching shipments, token present?', !!authToken);
      const res = await axios.get(`${API_BASE_URL}/shipments`, authToken ? {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      } : undefined);
      // console.log('AllShipmentsMain: fetch response status', res.status);
      // Extract shipments from response (handles both array and object with data property)
      const shipmentsData = res.data?.data || res.data || [];
      const sorted = Array.isArray(shipmentsData) ? shipmentsData.sort((a, b) => getTimestamp(b) - getTimestamp(a)) : [];
      // console.log('AllShipmentsMain: fetched shipments count', sorted.length);
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

  // Compute facility counts from shipments
  useEffect(() => {
    if (facilities.length === 0) return;
    
    const facilityCounts = {};
    shipments.forEach((s) => {
      const raw = (s.shipmentFacility || s.shipmentfacility || s.facility || '').toString();
      const name = raw.trim();
      if (!name) return;
      facilityCounts[name] = (facilityCounts[name] || 0) + 1;
    });
    
    // Create list with counts
    const facilityList = facilities.map(f => ({
      ...f,
      count: facilityCounts[f.name] || 0
    }));
    setFacilities(facilityList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipments]);

  const handleSearch = (searchTerm) => {
    setSearchQuery(searchTerm);
    const applied = applyFilters({ shipmentsList: shipments, status: selectedStatus, facility: selectedFacility, term: searchTerm });
    setFilteredShipments(applied);
  };


  const handleFilter = (status) => {
    setSelectedStatus(status);
    const applied = applyFilters({ shipmentsList: shipments, status, facility: selectedFacility, term: searchQuery });
    setFilteredShipments(applied);
  };

  const handleFacilityChange = (facility) => {
    setSelectedFacility(facility);
    const applied = applyFilters({ shipmentsList: shipments, status: selectedStatus, facility, term: searchQuery });
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
            throw new Error(err?.response?.data?.message || 'Failed to update status. Please try again.');
        }
    };

    const handleRegenerateQRCode = async (shipmentId) => {
        try {
            const authToken = token || localStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/shipments/${shipmentId}/regenerate-qr`, {}, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            console.log("QR code regenerated successfully:", res.data);
            alert('QR code regenerated successfully!');
            fetchShipments(); // Refresh data
            closeModal();
        } catch (err) {
            console.error("Failed to regenerate QR code:", err);
            alert(`Error: ${err.response?.data?.message || err.message}`);
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
    <div className="p-0 sm:p-4 md:p-6 space-y-4 sm:space-y-6 w-full">
      <div className='font-bold text-[18px] sm:text-[20px] md:text-[28px]'>All Shipments</div>
      {/* Toolbar and Filters */}
      <ShipmentToolbar
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onStatusChange={handleFilter}
        onFacilityChange={handleFacilityChange}
        selectedFacility={selectedFacility}
        selectedStatus={selectedStatus}
        facilities={facilities}
        statuses={statuses}
        onExport={() => exportToExcel(filteredShipments, 'All_Shipments')}
      />

      {/* Table */}
      <ShipmentTable
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
          statuses={statuses}
          />
        </BasicModal>
        )}

        {selectedShipment && (
        <BasicModal isOpen={modalType === 'print'} onClose={closeModal}>
            <PrintModal shipment={selectedShipment} onClose={closeModal} />
        </BasicModal>
        )}

        {selectedShipment && (
        <BasicModal isOpen={modalType === 'qr'} onClose={closeModal}>
            <div className="bg-white rounded-lg p-6 w-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-green-900">QR Code</h3>
                    <button
                        onClick={closeModal}
                        className="text-red-600 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>
                
                <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Tracking Number: <strong>{selectedShipment.trackingNumber}</strong></p>
                    {selectedShipment.qrCodeUrl ? (
                        <div className="flex justify-center mb-4">
                            <img src={selectedShipment.qrCodeUrl} alt="QR Code" style={{width: '200px', height: '200px'}} className="border border-gray-300 rounded" />
                        </div>
                    ) : (
                        <div className="flex justify-center mb-4 bg-gray-100 p-8 rounded">
                            <p className="text-gray-500 text-center">QR Code not available. Click regenerate to create one.</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => handleRegenerateQRCode(selectedShipment._id)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition mb-2"
                >
                    Regenerate QR Code
                </button>

                {selectedShipment.qrCodeUrl && (
                    <a
                        href={selectedShipment.qrCodeUrl}
                        download={`QR-${selectedShipment.trackingNumber}.png`}
                        className="w-full block text-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                    >
                        Download QR Code
                    </a>
                )}
            </div>
        </BasicModal>
        )}
    </div>
  );
}

