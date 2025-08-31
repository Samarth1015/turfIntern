'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Phone, Mail, User, LogOut } from 'lucide-react';
import { SignInButton, SignUpButton, UserButton, useUser, useAuth } from '@clerk/nextjs';

interface Court {
  id: string;
  name: string;
  description: string;
  timeSlots: TimeSlot[];
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
  bookings: unknown[];
}

interface BookingForm {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  selectedDate: string;
  selectedTimeSlot: string | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    selectedDate: '',
    selectedTimeSlot: null
  });
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetchCourts();
  }, []);

  useEffect(() => {
    if (isSignedIn && user) {
      // Pre-fill form with user data
      setBookingForm(prev => ({
        ...prev,
        customerName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        customerEmail: user.primaryEmailAddress?.emailAddress || ''
      }));
      
      // Get JWT token from backend
      getJwtToken();
    } else {
      setJwtToken(null);
    }
  }, [isSignedIn, user]);

  const getJwtToken = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/sync-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress || '',
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
        }),
      });

      const data = await response.json();
      if (data.success && data.data.token) {
        setJwtToken(data.data.token);
      }
    } catch (error) {
      console.error('Error getting JWT token:', error);
    }
  };

  const fetchCourts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/courts`);
      const data = await response.json();
      if (data.success) {
        setCourts(data.data);
        if (data.data.length > 0) {
          setSelectedCourt(data.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching courts:', error);
    }
  };

  const fetchAvailableSlots = async (courtId: string, date: string) => {
    if (!date) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/timeslots/available/${courtId}?date=${date}`);
      const data = await response.json();
      if (data.success) {
        setAvailableSlots(data.data);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date: string) => {
    setBookingForm(prev => ({ ...prev, selectedDate: date, selectedTimeSlot: null }));
    if (selectedCourt) {
      fetchAvailableSlots(selectedCourt.id, date);
    }
  };

  const handleTimeSlotSelect = (timeSlotId: string) => {
    if (!isSignedIn) {
      alert('Please sign in to book a court');
      return;
    }
    
    if (!jwtToken) {
      alert('Please wait while we authenticate you...');
      return;
    }
    
    setBookingForm(prev => ({ ...prev, selectedTimeSlot: timeSlotId }));
    setShowBookingForm(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourt || !bookingForm.selectedTimeSlot) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken || ''}`
        },
        body: JSON.stringify({
          courtId: selectedCourt.id,
          timeSlotId: bookingForm.selectedTimeSlot,
          customerName: bookingForm.customerName,
          customerEmail: bookingForm.customerEmail,
          customerPhone: bookingForm.customerPhone,
          bookingDate: bookingForm.selectedDate
        }),
      });

      const data = await response.json();
      if (data.success) {
        setBookingSuccess(true);
        setShowBookingForm(false);
        setBookingForm({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          selectedDate: '',
          selectedTimeSlot: null
        });
        // Refresh available slots
        if (selectedCourt) {
          fetchAvailableSlots(selectedCourt.id, bookingForm.selectedDate);
        }
      }
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };

  const isSlotAvailable = (timeSlot: TimeSlot) => {
    return timeSlot.bookings.length === 0;
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Turf Booking</h1>
                <p className="text-sm text-gray-600">Book your favorite sports court</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
               
              </div>
              
              {isSignedIn ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700">
                    Welcome, {user?.firstName || 'User'}!
                  </span>
                  <UserButton afterSignOutUrl="/" />
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <SignInButton mode="modal">
                    <button className="px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Authentication Notice */}
        {!isSignedIn && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-900">Sign in to book courts</h3>
                <p className="text-sm text-blue-700">Create an account or sign in to make bookings and manage your reservations.</p>
              </div>
            </div>
          </div>
        )}

        {/* JWT Token Status */}
        {isSignedIn && !jwtToken && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-yellow-400 rounded-full"></div>
              <div>
                <h3 className="font-medium text-yellow-900">Setting up your session...</h3>
                <p className="text-sm text-yellow-700">Please wait while we authenticate you with our system.</p>
              </div>
            </div>
          </div>
        )}

        {/* Court Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select a Court</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {courts.map((court) => (
              <div
                key={court.id}
                onClick={() => setSelectedCourt(court)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedCourt?.id === court.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-gray-900">{court.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{court.description}</p>
              </div>
            ))}
          </div>
        </div>

        {selectedCourt && (
          <>
            {/* Date Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Date</h2>
              <div className="flex items-center space-x-4">
                <Calendar className="w-5 h-5 text-gray-600" />
                <input
                  type="date"
                  value={bookingForm.selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                />
              </div>
            </div>

            {/* Available Time Slots */}
            {bookingForm.selectedDate && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Time Slots</h2>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading available slots...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {availableSlots.map((timeSlot) => (
                      <button
                        key={timeSlot.id}
                        onClick={() => handleTimeSlotSelect(timeSlot.id)}
                        disabled={!isSlotAvailable(timeSlot)}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                          isSlotAvailable(timeSlot)
                            ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-400'
                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-semibold">{formatTime(timeSlot.startTime)}</div>
                          <div className="text-xs">to</div>
                          <div className="font-semibold">{formatTime(timeSlot.endTime)}</div>
                          <div className="text-xs mt-1">{getDayName(timeSlot.dayOfWeek)}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Booking Form Modal */}
        {showBookingForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Your Booking</h3>
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingForm.customerName}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, customerName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={bookingForm.customerEmail}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={bookingForm.customerPhone}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Success Message */}
        {bookingSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-full"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Confirmed!</h3>
              <p className="text-gray-600 mb-4">
                Your booking has been successfully created. You will receive a confirmation email shortly.
              </p>
              <button
                onClick={() => setBookingSuccess(false)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
