import React, { useState, useEffect } from 'react';
import { Truck, User, MapPin, Phone, Star, Weight, Calendar } from 'lucide-react';
import TruckerLayout from '../../components/layouts/truckerLayout';
import axios from 'axios';
import { BACKEND_Local } from '../../../url.js';
import useAuthStore from '../auth/auth';
import { ClipLoader } from 'react-spinners';

const COUNTRY_CODES = [
    { code: '+1', country: 'United States/Canada' },
    { code: '+7', country: 'Russia/Kazakhstan' },
    { code: '+20', country: 'Egypt' },
    { code: '+27', country: 'South Africa' },
    { code: '+30', country: 'Greece' },
    { code: '+31', country: 'Netherlands' },
    { code: '+32', country: 'Belgium' },
    { code: '+33', country: 'France' },
    { code: '+34', country: 'Spain' },
    { code: '+36', country: 'Hungary' },
    { code: '+39', country: 'Italy' },
    { code: '+40', country: 'Romania' },
    { code: '+41', country: 'Switzerland' },
    { code: '+43', country: 'Austria' },
    { code: '+44', country: 'United Kingdom' },
    { code: '+45', country: 'Denmark' },
    { code: '+46', country: 'Sweden' },
    { code: '+47', country: 'Norway' },
    { code: '+48', country: 'Poland' },
    { code: '+49', country: 'Germany' },
    { code: '+51', country: 'Peru' },
    { code: '+52', country: 'Mexico' },
    { code: '+53', country: 'Cuba' },
    { code: '+54', country: 'Argentina' },
    { code: '+55', country: 'Brazil' },
    { code: '+56', country: 'Chile' },
    { code: '+57', country: 'Colombia' },
    { code: '+58', country: 'Venezuela' },
    { code: '+60', country: 'Malaysia' },
    { code: '+61', country: 'Australia' },
    { code: '+62', country: 'Indonesia' },
    { code: '+63', country: 'Philippines' },
    { code: '+64', country: 'New Zealand' },
    { code: '+65', country: 'Singapore' },
    { code: '+66', country: 'Thailand' },
    { code: '+81', country: 'Japan' },
    { code: '+82', country: 'South Korea' },
    { code: '+84', country: 'Vietnam' },
    { code: '+86', country: 'China' },
    { code: '+90', country: 'Turkey' },
    { code: '+91', country: 'India' },
    { code: '+92', country: 'Pakistan' },
    { code: '+93', country: 'Afghanistan' },
    { code: '+94', country: 'Sri Lanka' },
    { code: '+95', country: 'Myanmar' },
    { code: '+98', country: 'Iran' },
    { code: '+212', country: 'Morocco' },
    { code: '+213', country: 'Algeria' },
    { code: '+216', country: 'Tunisia' },
    { code: '+218', country: 'Libya' },
    { code: '+220', country: 'Gambia' },
    { code: '+221', country: 'Senegal' },
    { code: '+222', country: 'Mauritania' },
    { code: '+223', country: 'Mali' },
    { code: '+224', country: 'Guinea' },
    { code: '+225', country: 'Ivory Coast' },
    { code: '+226', country: 'Burkina Faso' },
    { code: '+227', country: 'Niger' },
    { code: '+228', country: 'Togo' },
    { code: '+229', country: 'Benin' },
    { code: '+230', country: 'Mauritius' },
    { code: '+231', country: 'Liberia' },
    { code: '+232', country: 'Sierra Leone' },
    { code: '+233', country: 'Ghana' },
    { code: '+234', country: 'Nigeria' },
    { code: '+235', country: 'Chad' },
    { code: '+236', country: 'Central African Republic' },
    { code: '+237', country: 'Cameroon' },
    { code: '+238', country: 'Cape Verde' },
    { code: '+239', country: 'São Tomé and Príncipe' },
    { code: '+240', country: 'Equatorial Guinea' },
    { code: '+241', country: 'Gabon' },
    { code: '+242', country: 'Republic of the Congo' },
    { code: '+243', country: 'DR Congo' },
    { code: '+244', country: 'Angola' },
    { code: '+245', country: 'Guinea-Bissau' },
    { code: '+246', country: 'British Indian Ocean Territory' },
    { code: '+248', country: 'Seychelles' },
    { code: '+249', country: 'Sudan' },
    { code: '+250', country: 'Rwanda' },
    { code: '+251', country: 'Ethiopia' },
    { code: '+252', country: 'Somalia' },
    { code: '+253', country: 'Djibouti' },
    { code: '+254', country: 'Kenya' },
    { code: '+255', country: 'Tanzania' },
    { code: '+256', country: 'Uganda' },
    { code: '+257', country: 'Burundi' },
    { code: '+258', country: 'Mozambique' },
    { code: '+260', country: 'Zambia' },
    { code: '+261', country: 'Madagascar' },
    { code: '+262', country: 'Reunion' },
    { code: '+263', country: 'Zimbabwe' },
    { code: '+264', country: 'Namibia' },
    { code: '+265', country: 'Malawi' },
    { code: '+266', country: 'Lesotho' },
    { code: '+267', country: 'Botswana' },
    { code: '+268', country: 'Eswatini' },
    { code: '+269', country: 'Comoros' },
    { code: '+290', country: 'Saint Helena' },
    { code: '+291', country: 'Eritrea' },
    { code: '+297', country: 'Aruba' },
    { code: '+298', country: 'Faroe Islands' },
    { code: '+299', country: 'Greenland' },
    { code: '+350', country: 'Gibraltar' },
    { code: '+351', country: 'Portugal' },
    { code: '+352', country: 'Luxembourg' },
    { code: '+353', country: 'Ireland' },
    { code: '+354', country: 'Iceland' },
    { code: '+355', country: 'Albania' },
    { code: '+356', country: 'Malta' },
    { code: '+357', country: 'Cyprus' },
    { code: '+358', country: 'Finland' },
    { code: '+359', country: 'Bulgaria' },
    { code: '+370', country: 'Lithuania' },
    { code: '+371', country: 'Latvia' },
    { code: '+372', country: 'Estonia' },
    { code: '+373', country: 'Moldova' },
    { code: '+374', country: 'Armenia' },
    { code: '+375', country: 'Belarus' },
    { code: '+376', country: 'Andorra' },
    { code: '+377', country: 'Monaco' },
    { code: '+378', country: 'San Marino' },
    { code: '+380', country: 'Ukraine' },
    { code: '+381', country: 'Serbia' },
    { code: '+382', country: 'Montenegro' },
    { code: '+383', country: 'Kosovo' },
    { code: '+385', country: 'Croatia' },
    { code: '+386', country: 'Slovenia' },
    { code: '+387', country: 'Bosnia and Herzegovina' },
    { code: '+389', country: 'North Macedonia' },
    { code: '+420', country: 'Czech Republic' },
    { code: '+421', country: 'Slovakia' },
    { code: '+423', country: 'Liechtenstein' },
    { code: '+500', country: 'Falkland Islands' },
    { code: '+501', country: 'Belize' },
    { code: '+502', country: 'Guatemala' },
    { code: '+503', country: 'El Salvador' },
    { code: '+504', country: 'Honduras' },
    { code: '+505', country: 'Nicaragua' },
    { code: '+506', country: 'Costa Rica' },
    { code: '+507', country: 'Panama' },
    { code: '+509', country: 'Haiti' },
    { code: '+590', country: 'Guadeloupe' },
    { code: '+591', country: 'Bolivia' },
    { code: '+592', country: 'Guyana' },
    { code: '+593', country: 'Ecuador' },
    { code: '+595', country: 'Paraguay' },
    { code: '+597', country: 'Suriname' },
    { code: '+598', country: 'Uruguay' },
    { code: '+599', country: 'Netherlands Antilles' },
    { code: '+670', country: 'East Timor' },
    { code: '+672', country: 'Norfolk Island' },
    { code: '+673', country: 'Brunei' },
    { code: '+674', country: 'Nauru' },
    { code: '+675', country: 'Papua New Guinea' },
    { code: '+676', country: 'Tonga' },
    { code: '+677', country: 'Solomon Islands' },
    { code: '+678', country: 'Vanuatu' },
    { code: '+679', country: 'Fiji' },
    { code: '+680', country: 'Palau' },
    { code: '+681', country: 'Wallis and Futuna' },
    { code: '+682', country: 'Cook Islands' },
    { code: '+683', country: 'Niue' },
    { code: '+685', country: 'Samoa' },
    { code: '+686', country: 'Kiribati' },
    { code: '+687', country: 'New Caledonia' },
    { code: '+688', country: 'Tuvalu' },
    { code: '+689', country: 'French Polynesia' },
    { code: '+690', country: 'Tokelau' },
    { code: '+691', country: 'Micronesia' },
    { code: '+692', country: 'Marshall Islands' },
    { code: '+850', country: 'North Korea' },
    { code: '+852', country: 'Hong Kong' },
    { code: '+853', country: 'Macau' },
    { code: '+855', country: 'Cambodia' },
    { code: '+856', country: 'Laos' },
    { code: '+880', country: 'Bangladesh' },
    { code: '+886', country: 'Taiwan' },
    { code: '+960', country: 'Maldives' },
    { code: '+961', country: 'Lebanon' },
    { code: '+962', country: 'Jordan' },
    { code: '+963', country: 'Syria' },
    { code: '+964', country: 'Iraq' },
    { code: '+965', country: 'Kuwait' },
    { code: '+966', country: 'Saudi Arabia' },
    { code: '+967', country: 'Yemen' },
    { code: '+968', country: 'Oman' },
    { code: '+970', country: 'Palestine' },
    { code: '+971', country: 'United Arab Emirates' },
    { code: '+972', country: 'Israel' },
    { code: '+973', country: 'Bahrain' },
    { code: '+974', country: 'Qatar' },
    { code: '+975', country: 'Bhutan' },
    { code: '+976', country: 'Mongolia' },
    { code: '+977', country: 'Nepal' },
    { code: '+992', country: 'Tajikistan' },
    { code: '+993', country: 'Turkmenistan' },
    { code: '+994', country: 'Azerbaijan' },
    { code: '+995', country: 'Georgia' },
    { code: '+996', country: 'Kyrgyzstan' },
    { code: '+998', country: 'Uzbekistan' },
].sort((a, b) => a.country.localeCompare(b.country)); // Sort alphabetically by country name

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
                <h3 className="text-lg font-bold mb-4 dark:text-white">Confirm Delete</h3>
                <p className="mb-6 dark:text-gray-300">Are you sure you want to delete this truck?</p>
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

const TruckerCard = ({ truck, onEdit, onDelete }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        onDelete(truck);
        setShowDeleteModal(false);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-t-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 h-full">
           <div className='flex flex-col justify-between h-full bg-sky-800 dark:bg-sky-900'>
            <div className="px-4 py-2">
                <h3 className="text-lg sm:text-md font-bold text-white flex items-center">
                    <User className="mr-2" size={20} />
                    {truck.driverName}
                </h3>
            </div>
            <div className="p-4 sm:p-3 space-y-2 bg-white dark:bg-gray-800 rounded-t-xl">
                <div className="flex items-center text-gray-700 dark:text-gray-200">
                    <Truck className="mr-2" size={18} />
                    <span className="font-semibold text-sm sm:text-base">{truck.truckType}</span>
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-200">
                    <MapPin className="mr-2" size={18} />
                    <span className="text-sm sm:text-base">{truck.location}</span>
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-200">
                    <Calendar className="mr-2" size={18} />
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${truck.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                        {truck.status}
                    </span>
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-200">
                    <Phone className="mr-2" size={18} />
                    <a href={`tel:${truck.driverPhone}`} className="text-sm sm:text-base">{truck.driverPhone}</a>
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-200">
                    <Star className="mr-2" size={18} />
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={16}
                                className={`${i < Math.floor(truck.rating)
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300 dark:text-gray-600'
                                    }`}
                            />
                        ))}
                        <span className="ml-2 text-xs font-semibold">{truck.rating}</span>
                    </div>
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-200">
                    <Weight className="mr-2" size={18} />
                    <span className="text-sm sm:text-base">{truck.maximumWeight} t</span>
                </div>
                <div className='flex gap-6 w-3/4 mx-6'>
                    <button
                        className="mt-4 px-4 py-2 bg-blue-600 w-1/2 text-white rounded-lg hover:bg-blue-600 transition duration-200"
                        onClick={() => onEdit(truck)}
                    >
                        Edit
                    </button>
                    <button 
                        className='mt-4 px-4 py-2 bg-red-500 text-white w-1/2 rounded-lg hover:bg-red-600 transition duration-200'
                        onClick={handleDeleteClick}
                    >
                        Delete
                    </button>
                </div>
            </div>
           </div>
           <DeleteConfirmModal 
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
            />
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
    const [driverName, setDriverName] = useState('');
    const [licence, setLicence] = useState('');
    const [passport, setPassport] = useState('');
    const [driverPhone, setDriverPhone] = useState('');
    const [truckOwnerPhone, setTruckOwnerPhone] = useState('');
    const [truckOwnerWhatsapp, setTruckOwnerWhatsapp] = useState('');
    const [location, setLocation] = useState('');
    const [maximumWeight, setMaximumWeight] = useState(0);
    const [driverPhoneCode, setDriverPhoneCode] = useState('+263');
    const [ownerPhoneCode, setOwnerPhoneCode] = useState('+263');
    const [ownerWhatsappCode, setOwnerWhatsappCode] = useState('+263');

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

    const handleDelete = async (truck) => {
        try {
            await axios.delete(`${BACKEND_Local}/api/trucker/delete/${truck._id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            fetchTrucks(); // Refresh the trucks list
        } catch (error) {
            console.error('Error deleting truck:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormMessage('');

        try {
            const url = isEditing
                ? `${BACKEND_Local}/api/trucker/update/${currentTruck._id}`
                : `${BACKEND_Local}/api/trucker/add`;
            const response = isEditing
                ? await axios.put(url, { truckerID, truckType, horse, trailer1, trailer2, driverName, licence, passport, driverPhone, truckOwnerPhone, truckOwnerWhatsapp, location, maximumWeight },
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }   
                )
                : await axios.post(url, { truckerID, truckType, horse, trailer1, trailer2, driverName, licence, passport, driverPhone, truckOwnerPhone, truckOwnerWhatsapp, location, maximumWeight },
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    });

            setFormMessage(isEditing ? 'Truck updated successfully!' : 'Truck added successfully!');
            setTruckType('');
            setHorse('');
            setTrailer1('');
            setTrailer2('');
            setDriverName('');
            setLicence('');
            setPassport('');
            setDriverPhone('');
            setTruckOwnerPhone('');
            setTruckOwnerWhatsapp('');
            setLocation('');
            setMaximumWeight('');
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
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">Available Trucks</h1>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search by name, truck, or location..."
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={filterAvailability}
                            onChange={(e) => setFilterAvailability(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="standby">Standby</option>
                        </select>
                        <button
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
                            onClick={() => setShowForm(!showForm)}
                        >
                            {showForm ? 'Hide Form' : 'Add Truck'}
                        </button>
                    </div>

                    {showForm && (
                        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Truck Type</label>
                                    <select
                                        name="truckType"
                                        value={truckType}
                                        onChange={(e) => setTruckType(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Horse Reg</label>
                                    <input
                                        type="text"
                                        name="horse"
                                        value={horse}
                                        onChange={(e) => setHorse(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Trailer 1 Reg</label>
                                    <input
                                        type="text"
                                        name="trailer1"
                                        value={trailer1}
                                        onChange={(e) => setTrailer1(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Trailer 2 Reg</label>
                                    <input
                                        type="text"
                                        name="trailer2"
                                        value={trailer2}
                                        onChange={(e) => setTrailer2(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Driver Name</label>
                                    <input
                                        type="text"
                                        name="driverName"
                                        value={driverName}
                                        onChange={(e) => setDriverName(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Driver Licence</label>
                                    <input
                                        type="text"
                                        name="licence"
                                        value={licence}
                                        onChange={(e) => setLicence(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Driver Passport</label>
                                    <input
                                        type="text"
                                        name="passport"
                                        value={passport}
                                        onChange={(e) => setPassport(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Driver Phone</label>
                                    <div className="flex">
                                        <select
                                            value={driverPhoneCode}
                                            onChange={(e) => setDriverPhoneCode(e.target.value)}
                                            className="inline-flex items-center  px-3 sm:px-4 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 text-xs sm:text-sm focus:ring-blue-500 focus:border-blue-500"
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
                                            className="mt-0 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-r-md shadow-sm py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Truck Owner Phone</label>
                                    <div className="flex">
                                        <select
                                            value={ownerPhoneCode}
                                            onChange={(e) => setOwnerPhoneCode(e.target.value)}
                                            className="inline-flex items-center px-3 sm:px-4 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 text-xs sm:text-sm focus:ring-blue-500 focus:border-blue-500"
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
                                            className="mt-0 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-r-md shadow-sm py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Truck Owner WhatsApp</label>
                                    <div className="flex">
                                        <select
                                            value={ownerWhatsappCode}
                                            onChange={(e) => setOwnerWhatsappCode(e.target.value)}
                                            className="inline-flex items-center px-3 sm:px-4 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 text-xs sm:text-sm focus:ring-blue-500 focus:border-blue-500"
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
                                            className="mt-0 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-r-md shadow-sm py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Maximum Weight (tons)</label>
                                    <input
                                        type="number"
                                        name="maximumWeight"
                                        value={maximumWeight}
                                        onChange={(e) => setMaximumWeight(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 w-full">
                            {filteredTrucks.map((truck) => (
                                <TruckerCard 
                                    key={truck.id} 
                                    truck={truck} 
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </TruckerLayout>
    );
}

export default Trucks;
