'use client';

import React, { useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

interface FormData {
  name: string;
  description: string;
  category: string;
  city: string;
  location: string;
  placeName: string;
  streetName: string;
  state: string;
  zipCode: string;
  websiteURL: string;
  instagramURL: string;
  twitterURL: string;
  facebookURL: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

export default function CreatePublisherPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: '',
    city: '',
    location: '',
    placeName: '',
    streetName: '',
    state: '',
    zipCode: '',
    websiteURL: '',
    instagramURL: '',
    twitterURL: '',
    facebookURL: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadLogoToSupabase = async () => {
    if (!logoFile) return null;
    
    try {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase
        .storage
        .from('publisher-logos')
        .upload(fileName, logoFile, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) {
        throw error;
      }
      
      // Get the public URL of the uploaded file
      const { data: { publicUrl } } = supabase
        .storage
        .from('publisher-logos')
        .getPublicUrl(fileName);
        
      return publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      return null;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Upload logo first
      const logoUrl = await uploadLogoToSupabase();
      
      // Insert publisher data into the database
      const { data, error } = await supabase
        .from('publishers')
        .insert([
          {
            name: formData.name,
            description: formData.description,
            category: formData.category,
            city: formData.city,
            location: formData.location,
            place_name: formData.placeName,
            street_name: formData.streetName,
            state: formData.state,
            zip_code: formData.zipCode,
            website_url: formData.websiteURL,
            instagram_url: formData.instagramURL,
            twitter_url: formData.twitterURL,
            facebook_url: formData.facebookURL,
            contact_name: formData.contactName,
            contact_email: formData.contactEmail,
            contact_phone: formData.contactPhone,
            tags: selectedTags,
            logo_url: logoUrl // Add logo URL to the publisher data
          }
        ])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      console.log('Publisher created:', data);
      // Redirect to publishers list or dashboard after successful creation
      router.push('/publisher/list');
    } catch (error) {
      console.error('Error creating publisher:', error);
      setSubmitError('Failed to create publisher. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tagOptions = [
    'Free', 'Art', 'Music', 'Outdoor', 'Gardening', 'Giving back', 'Sleep', 'Nutrition', 'Diabetes', 'Skincare',
    'Meditation', 'Wellness', 'Mindfulness', 'Spirituality', 'Losing weight', 'Support group', 'Smoking cessation',
    'Substance moderation', 'Dance', 'Pilates', 'Boxing', 'Walking club', 'Running', 'Zumba', 'Training', 'Bridge',
    'Mah jong', 'Bingo', 'Drop in class', 'Date night', 'New moms', 'Playdates', 'New friends', 'Learning', 'Books',
    'Lectures', 'Conference', 'Stand up', 'Relaxing', 'Beach', 'Lifestyle', 'Hobbies', 'Pets', 'Community', 'Family',
    'Seniors', 'Adults', 'Teens', 'Kids', 'Toddlers', 'Everyone'
  ];

  const categoryOptions = [
    { value: '', label: 'Choose a category' },
    { value: 'free', label: 'Free' },
    { value: 'art', label: 'Art' },
    { value: 'music', label: 'Music' },
    { value: 'outdoor', label: 'Outdoor' },
    { value: 'gardening', label: 'Gardening' },
    { value: 'giving-back', label: 'Giving back' },
    { value: 'sleep', label: 'Sleep' },
    { value: 'nutrition', label: 'Nutrition' },
    { value: 'diabetes', label: 'Diabetes' },
    { value: 'skincare', label: 'Skincare' },
    { value: 'meditation', label: 'Meditation' },
    { value: 'wellness', label: 'Wellness' },
    { value: 'mindfulness', label: 'Mindfulness' },
    { value: 'spirituality', label: 'Spirituality' },
    { value: 'losing-weight', label: 'Losing weight' },
    { value: 'support-group', label: 'Support group' },
    { value: 'smoking-cessation', label: 'Smoking cessation' },
    { value: 'substance-moderation', label: 'Substance moderation' },
    { value: 'dance', label: 'Dance' },
    { value: 'pilates', label: 'Pilates' },
    { value: 'boxing', label: 'Boxing' },
    { value: 'walking-club', label: 'Walking club' },
    { value: 'running', label: 'Running' },
    { value: 'zumba', label: 'Zumba' },
    { value: 'training', label: 'Training' },
    { value: 'bridge', label: 'Bridge' },
    { value: 'mah-jong', label: 'Mah jong' },
    { value: 'bingo', label: 'Bingo' },
    { value: 'drop-in-class', label: 'Drop in class' },
    { value: 'date-night', label: 'Date night' },
    { value: 'new-moms', label: 'New moms' },
    { value: 'playdates', label: 'Playdates' },
    { value: 'new-friends', label: 'New friends' },
    { value: 'learning', label: 'Learning' },
    { value: 'books', label: 'Books' },
    { value: 'lectures', label: 'Lectures' },
    { value: 'conference', label: 'Conference' },
    { value: 'stand-up', label: 'Stand up' },
    { value: 'relaxing', label: 'Relaxing' },
    { value: 'beach', label: 'Beach' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'hobbies', label: 'Hobbies' },
    { value: 'pets', label: 'Pets' },
    { value: 'community', label: 'Community' },
    { value: 'family', label: 'Family' },
    { value: 'seniors', label: 'Seniors' },
    { value: 'adults', label: 'Adults' },
    { value: 'teens', label: 'Teens' },
    { value: 'kids', label: 'Kids' },
    { value: 'toddlers', label: 'Toddlers' },
    { value: 'everyone', label: 'Everyone' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <Header />

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="overflow-hidden sm:rounded-lg">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create new publisher</h1>
              {/* <p className="text-gray-600 mt-2">Fill in the details below to create a new publisher profile</p> */}
            </div>

            {submitError && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Details Block */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Details</h2>
                
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="relative">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLogoChange}
                        accept="image/*"
                        className="hidden"
                      />
                      {logoPreview ? (
                        <div className="relative">
                          <img
                            src={logoPreview}
                            alt="Publisher logo preview"
                            className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
                          <span className="text-gray-500 text-4xl">+</span>
                        </div>
                      )}
                      <button 
                        type="button"
                        onClick={handleLogoClick}
                        className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-700 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="flex-1">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        * Name (As it will appear on VillageWell)
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="Enter publisher name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      * Partner description (As it will appear on VillageWell)
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Describe the publisher..."
                      required
                    />
                    <div className="text-sm text-gray-500 mt-1">{formData.description.length}/2000 characters</div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                        * Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        required
                      >
                        {categoryOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <select
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      >
                        <option value="">Choose option</option>
                        <option value="tampa">Tampa</option>
                        <option value="orlando">Orlando</option>
                        <option value="miami">Miami</option>
                        <option value="jacksonville">Jacksonville</option>
                        <option value="tallahassee">Tallahassee</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Tags Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (Select up to 3 options)
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tagOptions.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagClick(tag)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            selectedTags.includes(tag)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      {selectedTags.length} of 3 tags selected
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Block */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Location</h2>
                
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Please confirm the location by selecting the address in the Google Places autocomplete
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                        * Location (Google Places autocomplete)
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Address, city, state"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="placeName" className="block text-sm font-medium text-gray-700 mb-1">
                        Place name
                      </label>
                      <input
                        type="text"
                        id="placeName"
                        name="placeName"
                        value={formData.placeName}
                        onChange={handleChange}
                        placeholder="Place name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label htmlFor="streetName" className="block text-sm font-medium text-gray-700 mb-1">
                        Street name
                      </label>
                      <input
                        type="text"
                        id="streetName"
                        name="streetName"
                        value={formData.streetName}
                        onChange={handleChange}
                        placeholder="Street"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="City"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="State"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                    </div>
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Zip code
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        placeholder="Zip code"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Online Information Block */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Online Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="websiteURL" className="block text-sm font-medium text-gray-700 mb-1">
                      * Website URL
                    </label>
                    <input
                      type="url"
                      id="websiteURL"
                      name="websiteURL"
                      value={formData.websiteURL}
                      onChange={handleChange}
                      placeholder="https://example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="instagramURL" className="block text-sm font-medium text-gray-700 mb-1">
                        Instagram
                      </label>
                      <input
                        type="url"
                        id="instagramURL"
                        name="instagramURL"
                        value={formData.instagramURL}
                        onChange={handleChange}
                        placeholder="https://instagram.com/username"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                    </div>
                    <div>
                      <label htmlFor="twitterURL" className="block text-sm font-medium text-gray-700 mb-1">
                        X (Twitter)
                      </label>
                      <input
                        type="url"
                        id="twitterURL"
                        name="twitterURL"
                        value={formData.twitterURL}
                        onChange={handleChange}
                        placeholder="https://twitter.com/username"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                    </div>
                    <div>
                      <label htmlFor="facebookURL" className="block text-sm font-medium text-gray-700 mb-1">
                        Facebook
                      </label>
                      <input
                        type="url"
                        id="facebookURL"
                        name="facebookURL"
                        value={formData.facebookURL}
                        onChange={handleChange}
                        placeholder="https://facebook.com/username"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information Block */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
                      * Name
                    </label>
                    <input
                      type="text"
                      id="contactName"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      placeholder="Contact person name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      * Email address
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      placeholder="contact@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                      * Phone number
                    </label>
                    <input
                      type="tel"
                      id="contactPhone"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      placeholder="(123) 456-7890"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Save as draft
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create publisher now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}