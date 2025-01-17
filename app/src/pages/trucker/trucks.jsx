import React, { useState, useEffect } from 'react';
import TruckerLayout from '../../components/layouts/truckerLayout';
import axios from 'axios';
import { BACKEND_Local } from '../../../url.js';
import useAuthStore from '../auth/auth';
import { ClipLoader } from 'react-spinners';

const COUNTRY_CODES = [
    { code: '+1', country: 'US/CA' },
    { code: '+7', country: 'RU/KZ' },
    { code: '+20', country: 'EG' },
    { code: '+27', country: 'ZA' },
    { code: '+30', country: 'GR' },
    { code: '+31', country: 'NL' },
    { code: '+32', country: 'BE' },
    { code: '+33', country: 'FR' },
    { code: '+34', country: 'ES' },
    { code: '+36', country: 'HU' },
    { code: '+39', country: 'IT' },
    { code: '+40', country: 'RO' },
    { code: '+41', country: 'CH' },
    { code: '+43', country: 'AT' },
    { code: '+44', country: 'UK' },
    { code: '+45', country: 'DK' },
    { code: '+46', country: 'SE' },
    { code: '+47', country: 'NO' },
    { code: '+48', country: 'PL' },
    { code: '+49', country: 'DE' },
    { code: '+51', country: 'PE' },
    { code: '+52', country: 'MX' },
    { code: '+53', country: 'CU' },
    { code: '+54', country: 'AR' },
    { code: '+55', country: 'BR' },
    { code: '+56', country: 'CL' },
    { code: '+57', country: 'CO' },
    { code: '+58', country: 'VE' },
    { code: '+60', country: 'MY' },
    { code: '+61', country: 'AU' },
    { code: '+62', country: 'ID' },
    { code: '+63', country: 'PH' },
    { code: '+64', country: 'NZ' },
    { code: '+65', country: 'SG' },
    { code: '+66', country: 'TH' },
    { code: '+81', country: 'JP' },
    { code: '+82', country: 'KR' },
    { code: '+84', country: 'VN' },
    { code: '+86', country: 'CN' },
    { code: '+90', country: 'TR' },
    { code: '+91', country: 'IN' },
    { code: '+92', country: 'PK' },
    { code: '+93', country: 'AF' },
    { code: '+94', country: 'LK' },
    { code: '+95', country: 'MM' },
    { code: '+98', country: 'IR' },
    { code: '+212', country: 'MA' },
    { code: '+213', country: 'DZ' },
    { code: '+216', country: 'TN' },
    { code: '+218', country: 'LY' },
    { code: '+220', country: 'GM' },
    { code: '+221', country: 'SN' },
    { code: '+222', country: 'MR' },
    { code: '+223', country: 'ML' },
    { code: '+224', country: 'GN' },
    { code: '+225', country: 'CI' },
    { code: '+226', country: 'BF' },
    { code: '+227', country: 'NE' },
    { code: '+228', country: 'TG' },
    { code: '+229', country: 'BJ' },
    { code: '+230', country: 'MU' },
    { code: '+231', country: 'LR' },
    { code: '+232', country: 'SL' },
    { code: '+233', country: 'GH' },
    { code: '+234', country: 'NG' },
    { code: '+235', country: 'TD' },
    { code: '+236', country: 'CF' },
    { code: '+237', country: 'CM' },
    { code: '+238', country: 'CV' },
    { code: '+239', country: 'ST' },
    { code: '+240', country: 'GQ' },
    { code: '+241', country: 'GA' },
    { code: '+242', country: 'CG' },
    { code: '+243', country: 'CD' },
    { code: '+244', country: 'AO' },
    { code: '+245', country: 'GW' },
    { code: '+246', country: 'IO' },
    { code: '+248', country: 'SC' },
    { code: '+249', country: 'SD' },
    { code: '+250', country: 'RW' },
    { code: '+251', country: 'ET' },
    { code: '+252', country: 'SO' },
    { code: '+253', country: 'DJ' },
    { code: '+254', country: 'KE' },
    { code: '+255', country: 'TZ' },
    { code: '+256', country: 'UG' },
    { code: '+257', country: 'BI' },
    { code: '+258', country: 'MZ' },
    { code: '+260', country: 'ZM' },
    { code: '+261', country: 'MG' },
    { code: '+262', country: 'RE' },
    { code: '+263', country: 'ZW' },
    { code: '+264', country: 'NA' },
    { code: '+265', country: 'MW' },
    { code: '+266', country: 'LS' },
    { code: '+267', country: 'BW' },
    { code: '+268', country: 'SZ' },
    { code: '+269', country: 'KM' },
    { code: '+290', country: 'SH' },
    { code: '+291', country: 'ER' },
    { code: '+297', country: 'AW' },
    { code: '+298', country: 'FO' },
    { code: '+299', country: 'GL' },
    { code: '+350', country: 'GI' },
    { code: '+351', country: 'PT' },
    { code: '+352', country: 'LU' },
    { code: '+353', country: 'IE' },
    { code: '+354', country: 'IS' },
    { code: '+355', country: 'AL' },
    { code: '+356', country: 'MT' },
    { code: '+357', country: 'CY' },
    { code: '+358', country: 'FI' },
    { code: '+359', country: 'BG' },
    { code: '+370', country: 'LT' },
    { code: '+371', country: 'LV' },
    { code: '+372', country: 'EE' },
    { code: '+373', country: 'MD' },
    { code: '+374', country: 'AM' },
    { code: '+375', country: 'BY' },
    { code: '+376', country: 'AD' },
    { code: '+377', country: 'MC' },
    { code: '+378', country: 'SM' },
    { code: '+380', country: 'UA' },
    { code: '+381', country: 'RS' },
    { code: '+382', country: 'ME' },
    { code: '+383', country: 'XK' },
    { code: '+385', country: 'HR' },
    { code: '+386', country: 'SI' },
    { code: '+387', country: 'BA' },
    { code: '+389', country: 'MK' },
    { code: '+420', country: 'CZ' },
    { code: '+421', country: 'SK' },
    { code: '+423', country: 'LI' },
    { code: '+500', country: 'FK' },
    { code: '+501', country: 'BZ' },
    { code: '+502', country: 'GT' },
    { code: '+503', country: 'SV' },
    { code: '+504', country: 'HN' },
    { code: '+505', country: 'NI' },
    { code: '+506', country: 'CR' },
    { code: '+507', country: 'PA' },
    { code: '+509', country: 'HT' },
    { code: '+590', country: 'GP' },
    { code: '+591', country: 'BO' },
    { code: '+592', country: 'GY' },
    { code: '+593', country: 'EC' },
    { code: '+595', country: 'PY' },
    { code: '+597', country: 'SR' },
    { code: '+598', country: 'UY' },
    { code: '+599', country: 'AN' },
    { code: '+670', country: 'TL' },
    { code: '+672', country: 'NF' },
    { code: '+673', country: 'BN' },
    { code: '+674', country: 'NR' },
    { code: '+675', country: 'PG' },
    { code: '+676', country: 'TO' },
    { code: '+677', country: 'SB' },
    { code: '+678', country: 'VU' },
    { code: '+679', country: 'FJ' },
    { code: '+680', country: 'PW' },
    { code: '+681', country: 'WF' },
    { code: '+682', country: 'CK' },
    { code: '+683', country: 'NU' },
    { code: '+685', country: 'WS' },
    { code: '+686', country: 'KI' },
    { code: '+687', country: 'NC' },
    { code: '+688', country: 'TV' },
    { code: '+689', country: 'PF' },
    { code: '+690', country: 'TK' },
    { code: '+691', country: 'FM' },
    { code: '+692', country: 'MH' },
    { code: '+850', country: 'KP' },
    { code: '+852', country: 'HK' },
    { code: '+853', country: 'MO' },
    { code: '+855', country: 'KH' },
    { code: '+856', country: 'LA' },
    { code: '+880', country: 'BD' },
    { code: '+886', country: 'TW' },
    { code: '+960', country: 'MV' },
    { code: '+961', country: 'LB' },
    { code: '+962', country: 'JO' },
    { code: '+963', country: 'SY' },
    { code: '+964', country: 'IQ' },
    { code: '+965', country: 'KW' },
    { code: '+966', country: 'SA' },
    { code: '+967', country: 'YE' },
    { code: '+968', country: 'OM' },
    { code: '+970', country: 'PS' },
    { code: '+971', country: 'AE' },
    { code: '+972', country: 'IL' },
    { code: '+973', country: 'BH' },
    { code: '+974', country: 'QA' },
    { code: '+975', country: 'BT' },
    { code: '+976', country: 'MN' },
    { code: '+977', country: 'NP' },
    { code: '+992', country: 'TJ' },
    { code: '+993', country: 'TM' },
    { code: '+994', country: 'AZ' },
    { code: '+995', country: 'GE' },
    { code: '+996', country: 'KG' },
    { code: '+998', country: 'UZ' },
].sort((a, b) => a.country.localeCompare(b.country)); // Sort alphabetically by country name

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl">
                <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
                <p className="mb-6">Are you sure you want to delete this truck?</p>
                <div className="flex justify-end gap-4">
                    <button
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={onConfirm}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

const ViewDetailsModal = ({ isOpen, onClose, truck }) => {
    if (!isOpen || !truck) return null;

    const detailSections = [
        {
            title: "Vehicle Information",
            items: [
                { label: "Truck Type", value: truck.truckType },
                { label: "Maximum Weight", value: `${truck.maximumWeight} tons` },
                { label: "Current Location", value: truck.location },
                { 
                    label: "Truck Image", 
                    value: truck.truckImage ? (
                        <a href={`${BACKEND_Local}/api/media/public/${truck.truckImage}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                            View Image
                        </a>
                    ) : "Not Uploaded"
                }
            ]
        },
        {
            title: "Registration Details",
            items: [
                { label: "Horse Registration", value: truck.horse },
                { label: "Trailer 1 Registration", value: truck.trailer1 },
                { label: "Trailer 2 Registration", value: truck.trailer2 || "N/A" },
                { label: "Trailer 3 Registration", value: truck.trailer3 || "N/A" },
                { 
                    label: "Driver License File", 
                    value: truck.driverLicenseFile ? (
                        <a href={`${BACKEND_Local}/api/media/public/${truck.driverLicenseFile}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                            View File
                        </a>
                    ) : "Not Uploaded"
                },
                {
                    label: "Passport File", 
                    value: truck.passportFile ? (
                        <a href={`${BACKEND_Local}/api/media/public/${truck.passportFile}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                            View File
                        </a>
                    ) : "Not Uploaded"
                },
                {
                    label: "Truck Registration File", 
                    value: truck.truckRegistrationFile ? (
                        <a href={`${BACKEND_Local}/api/media/public/${truck.truckRegistrationFile}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                            View File
                        </a>
                    ) : "Not Uploaded"
                },
                {
                    label: "Insurance File", 
                    value: truck.truckInsuranceFile ? (
                        <a href={`${BACKEND_Local}/api/media/public/${truck.truckInsuranceFile}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                            View File
                        </a>
                    ) : "Not Uploaded"
                },
                {
                    label: "Road Worthy File", 
                    value: truck.truckRoadWorthyFile ? (
                        <a href={`${BACKEND_Local}/api/media/public/${truck.truckRoadWorthyFile}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                            View File
                        </a>
                    ) : "Not Uploaded"
                }
            ]
        },
        {
            title: "Driver Information",
            items: [
                { label: "Driver Name", value: truck.driverName },
                { label: "Driver License", value: truck.licence },
                { label: "Passport Number", value: truck.passport },
                { label: "Driver Phone", value: truck.driverPhone },
            ]
        },
        {
            title: "Owner Contact",
            items: [
                { label: "Owner Phone", value: truck.truckOwnerPhone },
                { label: "Owner WhatsApp", value: truck.truckOwnerWhatsapp },
            ]
        }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900">Truck Details</h3>
                    <button
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={onClose}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="px-6 py-4 space-y-6">
                    {detailSections.map((section, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">
                                {section.title}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {section.items.map((item, itemIdx) => (
                                    <div key={itemIdx} className="bg-white rounded-md p-3 shadow-sm">
                                        <p className="text-sm font-medium text-gray-500">
                                            {item.label}
                                        </p>
                                        <p className="text-base text-gray-900 mt-1">
                                            {item.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <button
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                        onClick={onClose}
                    >
                        <span>Close</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

function Trucks() {
    const { accessToken, clientID } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAvailability, setFilterAvailability] = useState('all');
    const [currentTruck, setCurrentTruck] = useState(null);
    const [trucks, setTrucks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formMessage, setFormMessage] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTrucker, setCurrentTrucker] = useState(null);
    const truckerID = clientID;
    const [truckType, setTruckType] = useState('');
    const [horse, setHorse] = useState('');
    const [trailer1, setTrailer1] = useState('');
    const [trailer2, setTrailer2] = useState('');
    const [trailer3, setTrailer3] = useState('');
    const [driverName, setDriverName] = useState('');
    const [licence, setLicence] = useState('');
    const [passport, setPassport] = useState('');
    const [driverPhone, setDriverPhone] = useState('');
    const [truckOwnerPhone, setTruckOwnerPhone] = useState('');
    const [truckOwnerWhatsapp, setTruckOwnerWhatsapp] = useState('');
    const [location, setLocation] = useState('');
    const [maximumWeight, setMaximumWeight] = useState(0);
    const [driverPhoneCode, setDriverPhoneCode] = useState('+263');
    const [truckOwnerPhoneCode, setTruckOwnerPhoneCode] = useState('+263');
    const [truckOwnerWhatsappCode, setTruckOwnerWhatsappCode] = useState('+263');
    const [driverLicenseFile, setDriverLicenseFile] = useState(null);
    const [passportFile, setPassportFile] = useState(null);
    const [truckRegistrationFile, setTruckRegistrationFile] = useState(null);
    const [truckInsuranceFile, setTruckInsuranceFile] = useState(null);
    const [truckRoadWorthyFile, setTruckRoadWorthyFile] = useState(null);  // Fix the typo here
    const [truckImage, setTruckImage] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [truckToDelete, setTruckToDelete] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [truckToView, setTruckToView] = useState(null);

    useEffect(() => {
        fetchTrucks();
    }, [accessToken, clientID]);

    const fetchTrucks = async () => {
        try {
            const response = await axios.get(`${BACKEND_Local}/api/trucker/trucks/${truckerID}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            
            setTrucks(response.data);
        } catch (error) {
            console.error('Error fetching truckers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (truck) => {
        setTruckToDelete(truck);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (truckToDelete) {
            try {
                await axios.delete(`${BACKEND_Local}/api/trucker/delete/${truckToDelete._id}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                fetchTrucks(); // Refresh the trucks list
            } catch (error) {
                console.error('Error deleting truck:', error);
            } finally {
                setIsDeleteModalOpen(false);
                setTruckToDelete(null);
            }
        }
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setTruckToDelete(null);
    };

    const handleViewClick = (truck) => {
        setTruckToView(truck);
        setIsViewModalOpen(true);
    };

    const handleViewClose = () => {
        setIsViewModalOpen(false);
        setTruckToView(null);
    };

    const handleFileChange = (e, setFile) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormMessage('');

        const formData = new FormData();
        formData.append('truckerID', truckerID);
        formData.append('truckType', truckType);
        formData.append('horse', horse);
        formData.append('trailer1', trailer1);
        formData.append('trailer2', trailer2);
        formData.append('trailer3', trailer3);
        formData.append('driverName', driverName);
        formData.append('licence', licence);
        formData.append('passport', passport);
        formData.append('driverPhone', driverPhone);
        formData.append('truckOwnerPhone', truckOwnerPhone);
        formData.append('truckOwnerWhatsapp', truckOwnerWhatsapp);
        formData.append('location', location);
        formData.append('maximumWeight', Number(maximumWeight));

        // Append files if they exist
        if (driverLicenseFile) formData.append('driverLicenseFile', driverLicenseFile);
        if (passportFile) formData.append('passportFile', passportFile);
        if (truckRegistrationFile) formData.append('truckRegistrationFile', truckRegistrationFile);
        if (truckInsuranceFile) formData.append('truckInsuranceFile', truckInsuranceFile);
        if (truckRoadWorthyFile) formData.append('truckRoadWorthyFile', truckRoadWorthyFile);
        if (truckImage) formData.append('truckImage', truckImage);

        try {
            const url = isEditing
                ? `${BACKEND_Local}/api/trucker/update/${currentTruck._id}`
                : `${BACKEND_Local}/api/trucker/add`;
            const response = isEditing
                ? await axios.put(url, formData, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'multipart/form-data'
                    }
                })
                : await axios.post(url, formData, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });

            setFormMessage(isEditing ? 'Truck updated successfully!' : 'Truck added successfully!');
            // Reset form fields
            setTruckType('');
            setHorse('');
            setTrailer1('');
            setTrailer2('');
            setTrailer3('');
            setDriverName('');
            setLicence('');
            setPassport('');
            setDriverPhone('');
            setTruckOwnerPhone('');
            setTruckOwnerWhatsapp('');
            setLocation('');
            setMaximumWeight('');
            // Reset file fields
            setDriverLicenseFile(null);
            setPassportFile(null);
            setTruckRegistrationFile(null);
            setTruckInsuranceFile(null);
            setTruckRoadWorthyFile(null);
            setTruckImage(null);
            
            fetchTrucks();
            setShowForm(false);
            setIsEditing(false);
            setCurrentTruck(null);


        } catch (error) {
            console.log(error);
            if (error.response && error.response.status === 409) {
                setFormMessage('Error: This truck or driver information already exists. Please check your entries and try again.');
            } else {
                setFormMessage(isEditing ? 'Error updating truck. Please try again later.' : 'Error adding truck. Please try again later.');
            }

        } finally {
            setFormLoading(false);
        }
    };

    

    const handleEdit = (truck) => {
        setCurrentTruck(truck);
        setTruckType(truck.truckType);
        setHorse(truck.horse);
        setTrailer1(truck.trailer1);
        setTrailer2(truck.trailer2);
        setTrailer3(truck.trailer3);
        setDriverName(truck.driverName);
        setLicence(truck.licence);
        setPassport(truck.passport);
        setDriverPhone(truck.driverPhone);
        setTruckOwnerPhone(truck.truckOwnerPhone);
        setTruckOwnerWhatsapp(truck.truckOwnerWhatsapp);
        setLocation(truck.location);
        setMaximumWeight(truck.maximumWeight);
        setIsEditing(true);
        setShowForm(true);
    };

    const filteredTrucks = trucks.filter(truck => {
        const matchesSearch = searchTerm === '' || (
            (truck.driverName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (truck.truckType?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (truck.location?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );

        const matchesAvailability =
            filterAvailability === 'all' ||
            (truck.status?.toLowerCase() || '') === filterAvailability.toLowerCase();

        return matchesSearch && matchesAvailability;
    });

    return (
        <TruckerLayout>
            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Manage Trucks</h1>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search by name, truck, or location..."
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={filterAvailability}
                            onChange={(e) => setFilterAvailability(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="loaded">Loaded</option>
                            <option value="standby">Standby</option>
                        </select>
                        <button
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
                            onClick={() => setShowForm(!showForm)}
                        >
                            {showForm ? 'Cancel' : 'Add Truck'}
                        </button>
                    </div>

                    {showForm && (
                        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Truck Type</label>
                                    <select
                                        name="truckType"
                                        value={truckType}
                                        onChange={(e) => setTruckType(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="">Select Truck Type</option>
                                        <option value="Flatbed">Flatbed</option>
                                        <option value="Box Truck">Box Truck</option>
                                        <option value="Refrigerated">Refrigerated</option>
                                        <option value="Tanker">Tanker</option>
                                        <option value="Dump Truck">Dump Truck</option>
                                        <option value="Tow Truck">Tow Truck</option>
                                        <option value="Furniture Truck">Furniture Truck</option>
                                        <option value="Small Ton Truck">Small Ton Truck</option>
                                        <option value="10T Curtain Truck">10T Curtain Truck</option>
                                        <option value="30T Drop Side">30T Drop Side</option>
                                        <option value="30T Flatbed">30T Flatbed</option>
                                        <option value="34T Link Bulk">34T Link Bulk</option>
                                        <option value="34T Link Flatbed">34T Link Flatbed</option>
                                        <option value="34T Side Tipper">34T Side Tipper</option>
                                        <option value="30T Howo Tipper">30T Howo Tipper</option>
                                        <option value="20T Tipper">20T Tipper</option>
                                        <option value="Lowbed">Lowbed</option>
                                        <option value="Semi Truck">Semi Truck</option>
                                        <option value="Can Carrier">Can Carrier</option>
                                        <option value="Crane">Crane</option>
                                        <option value="Livestock">Livestock</option>
                                        <option value="Logging">Logging</option>
                                        <option value="Abnormal">Abnormal</option>
                                        <option value="Tautliner">Tautliner</option>
                                        <option value="Water Bowser">Water Bowser</option>
                                        <option value="Fuel Tanker">Fuel Tanker</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Horse Reg</label>
                                    <input
                                        type="text"
                                        name="horse"
                                        value={horse}
                                        onChange={(e) => setHorse(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Trailer 1 Reg</label>
                                    <input
                                        type="text"
                                        name="trailer1"
                                        value={trailer1}
                                        onChange={(e) => setTrailer1(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Trailer 2 Reg</label>
                                    <input
                                        type="text"
                                        name="trailer2"
                                        value={trailer2}
                                        onChange={(e) => setTrailer2(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Trailer 3 Reg</label>
                                    <input
                                        type="text"
                                        name="trailer3"
                                        value={trailer3}
                                        onChange={(e) => setTrailer3(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Driver Name</label>
                                    <input
                                        type="text"
                                        name="driverName"
                                        value={driverName}
                                        onChange={(e) => setDriverName(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Driver Licence</label>
                                    <input
                                        type="text"
                                        name="licence"
                                        value={licence}
                                        onChange={(e) => setLicence(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Driver Passport</label>
                                    <input
                                       type="text"
                                        name="passport"
                                        value={passport}
                                        onChange={(e) => setPassport(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Driver Phone</label>
                                    <div className="flex">
                                        <select
                                            className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm"
                                            value={driverPhoneCode}
                                            onChange={(e) => setDriverPhoneCode(e.target.value)}
                                        >
                                            {COUNTRY_CODES.map(({ code, country }) => (
                                                <option key={code} value={code}>
                                                    {country} ({code})
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="tel"
                                            name="driverPhone"
                                            value={driverPhone}
                                            onChange={(e) => setDriverPhone(e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-r-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Truck Owner Phone</label>
                                    <div className="flex">
                                        <select
                                            className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm"
                                            value={truckOwnerPhoneCode}
                                            onChange={(e) => setTruckOwnerPhoneCode(e.target.value)}
                                        >
                                            {COUNTRY_CODES.map(({ code, country }) => (
                                                <option key={code} value={code}>
                                                    {country} ({code})
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="tel"
                                            name="truckOwnerPhone"
                                            value={truckOwnerPhone}
                                            onChange={(e) => setTruckOwnerPhone(e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-r-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Truck Owner WhatsApp</label>
                                    <div className="flex">
                                        <select
                                            className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm"
                                            value={truckOwnerWhatsappCode}
                                            onChange={(e) => setTruckOwnerWhatsappCode(e.target.value)}
                                        >
                                            {COUNTRY_CODES.map(({ code, country }) => (
                                                <option key={code} value={code}>
                                                    {country} ({code})
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="tel"
                                            name="truckOwnerWhatsapp"
                                            value={truckOwnerWhatsapp}
                                            onChange={(e) => setTruckOwnerWhatsapp(e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-r-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Maximum Weight (tons)</label>
                                    <input
                                        type="number"
                                        name="maximumWeight"
                                        value={maximumWeight}
                                        onChange={(e) => setMaximumWeight(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Driver License File</label>
                                    <input
                                        type="file"
                                        name="driverLicenseFile"
                                        onChange={(e) => handleFileChange(e, setDriverLicenseFile)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Passport File</label>
                                    <input
                                        type="file"
                                        name="passportFile"
                                        onChange={(e) => handleFileChange(e, setPassportFile)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Truck Registration File</label>
                                    <input
                                        type="file"
                                        name="truckRegistrationFile"
                                        onChange={(e) => handleFileChange(e, setTruckRegistrationFile)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Truck Insurance File</label>
                                    <input
                                        type="file"
                                        name="truckInsuranceFile"
                                        onChange={(e) => handleFileChange(e, setTruckInsuranceFile)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Truck Road Worthy File</label>
                                    <input
                                        type="file"
                                        name="truckRoadWorthyFile"
                                        onChange={(e) => handleFileChange(e, setTruckRoadWorthyFile)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Truck Image</label>
                                    <input
                                        type="file"
                                        name="truckImage"
                                        onChange={(e) => handleFileChange(e, setTruckImage)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="mt-6">
                                <button
                                    type="submit"
                                    className={`px-4 py-2 text-white rounded-lg ${formLoading ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-600'} transition duration-200`}
                                    disabled={formLoading}
                                >
                                    {formLoading ? <ClipLoader size={20} color="#ffffff" /> : isEditing ? 'Update Truck' : 'Add Truck'}
                                </button>
                                {formMessage && (
                                    <p className={`mt-2 text-sm ${formMessage.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
                                        {formMessage}
                                    </p>
                                )}
                            </div>
                        </form>
                    )}

                    {loading ? (
                        <div className="flex justify-center items-center">
                            <ClipLoader size={50} color="#3b82f6" />
                        </div>
                    ) : (
                        <div className="mt-8 flex flex-col">
                            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-300">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                                        Driver Name
                                                    </th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                        Truck Type
                                                    </th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                        Location
                                                    </th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                        Status
                                                    </th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                        Contact
                                                    </th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                        Max Weight
                                                    </th>
                                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                        <span className="sr-only">Actions</span>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {filteredTrucks.map((truck) => (
                                                    <tr key={truck._id}>
                                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                            {truck.driverName}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                            {truck.truckType}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                            {truck.location}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                                truck.status === 'loaded'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                {truck.status}
                                                            </span>
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                            {truck.driverPhone}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                            {truck.maximumWeight} tons
                                                        </td>
                                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                            <button
                                                                onClick={() => handleViewClick(truck)}
                                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                                            >
                                                                View
                                                            </button>
                                                            {truck.status !== 'loaded' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleEdit(truck)}
                                                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteClick(truck)}
                                                                        className="text-red-600 hover:text-red-900"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
            />
            <ViewDetailsModal
                isOpen={isViewModalOpen}
                onClose={handleViewClose}
                truck={truckToView}
            />

        </TruckerLayout>
    );
}

export default Trucks;
