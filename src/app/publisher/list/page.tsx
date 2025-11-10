"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/Header";

interface Publisher {
  id: string;
  name: string;
  description?: string;
  category?: string;
  city?: string;
  website_url?: string;
  contact_name?: string;
  contact_email?: string;
  created_at?: string;
  tags?: string[];
  status?: "active" | "deactivated";
  events_count?: number;
  articles_count?: number;
  logo_url?: string;
}

export default function PublishersListPage() {
    const router = useRouter();
    const [publishers, setPublishers] = useState<Publisher[]>([]);
    const [filteredPublishers, setFilteredPublishers] = useState<Publisher[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) router.push('/login');
    };

    useEffect(() => {
        fetchPublishers();
    }, []);

    useEffect(() => {
        let result = publishers;
        
        // Search filter
        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          result = result.filter(p =>
            (p.name || "").toLowerCase().includes(q) ||
            (p.description || "").toLowerCase().includes(q) ||
            (p.contact_name || "").toLowerCase().includes(q)
          );
        }
        
        // Category filter
        if (selectedCategory) {
          result = result.filter(p => p.category === selectedCategory);
        }
        
        // Status filter
        if (selectedStatus && selectedStatus !== "Any") {
          result = result.filter(p => p.status === selectedStatus.toLowerCase());
        }
        
        // Date range filter
        if (dateFrom) {
          result = result.filter(p => p.created_at && new Date(p.created_at) >= new Date(dateFrom));
        }
        
        if (dateTo) {
          result = result.filter(p => p.created_at && new Date(p.created_at) <= new Date(dateTo));
        }
        
        setFilteredPublishers(result);
        setCurrentPage(1); // Reset to first page when filters change
    }, [searchTerm, selectedCategory, selectedStatus, dateFrom, dateTo, publishers]);

    const fetchPublishers = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from("publishers")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;

            // normalize shape a bit in case some fields are missing
            const normalized: Publisher[] = (data || []).map((d: any) => ({
                id: d.id,
                name: d.name,
                description: d.description,
                category: d.category,
                city: d.city,
                website_url: d.website_url,
                contact_name: d.contact_name,
                contact_email: d.contact_email,
                created_at: d.created_at,
                tags: d.tags || [],
                status: d.status || "active",
                events_count: d.events_count || 0,
                articles_count: d.articles_count || 0,
                logo_url: d.logo_url || null,
            }));

            setPublishers(normalized);
            setFilteredPublishers(normalized);
        } catch (err: any) {
            console.error(err);
            setError(err?.message || "Unable to load publishers");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetFilters = () => {
        setSearchTerm("");
        setSelectedCategory("");
        setSelectedStatus("");
        setDateFrom("");
        setDateTo("");
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this publisher?")) return;
        try {
            const { error } = await supabase.from("publishers").delete().eq("id", id);
            if (error) throw error;
            setPublishers(prev => prev.filter(p => p.id !== id));
            setFilteredPublishers(prev => prev.filter(p => p.id !== id));
        } catch (err: any) {
            console.error(err);
            setError("Failed to delete publisher. Try again.");
        }
    };

    const categories = Array.from(new Set(publishers.map(p => p.category).filter(Boolean))) as string[];

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPublishers = filteredPublishers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPublishers.length / itemsPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    return (
      <div className="min-h-screen bg-gray-100">
        {/* Top bar */}
        <Header />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="overflow-hidden sm:rounded-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Publisher Panel</h1>
                  <p className="text-gray-600 mt-1">Publishers are the partners creating the content inside the app, like events and articles.</p>
                </div>
                <button
                  onClick={() => router.push('/publisher/create-publisher')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create new publisher
                </button>
              </div>

              {error && <div className="mb-4 text-red-700 bg-red-50 p-3 rounded">{error}</div>}

              {/* Filter box */}
              <div className="bg-white border border border-gray-200 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-end">
                  <div className="lg:col-span-4">
                    <label className="sr-only">Search</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => { }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        Search
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Everyone</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Status</label>
                    <select 
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Any</option>
                      <option value="Active">Active</option>
                      <option value="Deactivated">Deactivated</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">From</label>
                    <input 
                      type="date" 
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">To</label>
                    <input 
                      type="date" 
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleResetFilters}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Reset Filters
                    </button>
                  </div>

                </div>
              </div>


              {/* Table / list header */}
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Publishers</h2>

              {/* Card table */}
              <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
                <div className="hidden md:grid grid-cols-13 gap-4 px-6 py-3 border-b border-gray-100 text-sm text-gray-700 bg-gray-200">
                  <div className="col-span-5">Subject</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-2">Created</div>
                  <div className="col-span-1">Events</div>
                  <div className="col-span-1">Articles</div>

                </div>

                {isLoading ? (
                  <div className="p-6 text-center">
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                  </div>
                ) : filteredPublishers.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No publishers found.</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {currentPublishers.map((p) => (
                      <div key={p.id} className="grid grid-cols-13 gap-4 px-6 py-4 hover:bg-gray-50">
                        <div className="col-span-5 flex items-center gap-4">
                          {p.logo_url ? (
                            <img 
                              src={p.logo_url} 
                              alt={p.name} 
                              className="w-10 h-10 rounded-md object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700">
                              {(p.name || "").split(" ").slice(0, 2).map(s => s[0]).join("")}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{p.name}</div>
                            <div className="text-sm text-gray-500">
                              {/* {p.description ? p.description.slice(0, 80) + (p.description.length > 80 ? "..." : "") : '—'} */}
                            </div>
                          </div>
                        </div>

                        <div className="col-span-1 flex items-center">
                          {p.status === 'active' ? (
                            <span className="inline-block text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Active</span>
                          ) : (
                            <span className="inline-block text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">Deactivated</span>
                          )}
                        </div>

                        <div className="col-span-2 flex items-center text-sm text-gray-500">
                          {p.created_at ? new Date(p.created_at).toLocaleString() : '—'}
                        </div>
                        <div className="col-span-1 flex items-center text-sm text-gray-700">{p.events_count ?? 0}</div>
                        <div className="col-span-1 flex items-center text-sm text-gray-700">{p.articles_count ?? 0}</div>

                        <div className="col-span-2 flex items-center justify-end gap-3">
                          <button
                            onClick={() => router.push(`/publisher/view?id=${p.id}`)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => router.push(`/publisher/edit-publisher?id=${p.id}`)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div className="mt-6 flex items-center justify-center">
                <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-l-md border border-gray-200 ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    &lt;
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-3 py-2 border border-gray-200 ${currentPage === pageNumber ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className={`px-3 py-2 rounded-r-md border border-gray-200 ${currentPage === totalPages || totalPages === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    &gt;
                  </button>
                </nav>
              </div>

            </div>
          </div>
        </main>
      </div>
    );
    
}