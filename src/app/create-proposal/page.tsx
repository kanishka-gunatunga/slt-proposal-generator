'use client';

import React, { useState, useRef } from 'react';
import Layout from '@/components/Layout';
import Image from 'next/image';

const Page = () => {
    const [showModal, setShowModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [parsedData, setParsedData] = useState<any>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>("/template/business-proposal.pdf");


    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files).filter((file) =>
            file.name.match(/\.(xls|xlsx)$/)
        );
        setSelectedFiles((prev) => [...prev, ...files]);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).filter((file) =>
                file.name.match(/\.(xls|xlsx)$/)
            );
            setSelectedFiles((prev) => [...prev, ...newFiles]);
        }
    };

    const handleRemoveFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleProcess = async () => {
        setLoading(true);

        try {
            const formData = new FormData();
            selectedFiles.forEach((file) => formData.append('files', file));

            const response = await fetch('https://slt-backend-omega.vercel.app/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('API request failed');

            const result = await response.json();

            let parsed;
            try {
                parsed = typeof result === 'string' ? JSON.parse(result) : result;
            } catch (e) {
                console.error('Failed to parse result as JSON:', e);
                alert('Invalid data format received from server.');
                return;
            }

            console.log('Parsed API response:', parsed);

            setPdfUrl('/template/business-proposal.pdf');
            setParsedData(parsed);
            setShowModal(false);
            setShowCompleteModal(true);
        } catch (error) {
            console.error('Error processing files:', error);
            alert('There was an error processing your files.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <Layout>
            <div className="container mt-5">
                <h2>Create Proposal</h2>
                <button className="btn btn-primary mt-3" onClick={() => setShowModal(true)}>
                    Upload Excel Files
                </button>

                {showModal && (
                    <div className="modal show d-block" tabIndex={-1} onClick={() => setShowModal(false)} style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        height: '100vh',
                        width: '100vw',
                        zIndex: 1050,
                    }}>
                        <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Upload Excel Files</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>

                                <div className="modal-body">
                                    {loading ? (
                                        <div className="text-center">
                                            <div className="spinner-border text-success mb-3" role="status"></div>
                                            <p>Processing files, please wait...</p>
                                        </div>
                                    ) : (
                                        <div
                                            className="border border-secondary rounded p-4 text-center mb-3"
                                            onDrop={handleDrop}
                                            onDragOver={(e) => e.preventDefault()}
                                            onClick={() => fileInputRef.current?.click()}
                                            style={{ backgroundColor: '#f8f9fa', cursor: 'pointer', minHeight: '200px' }}
                                        >
                                            <input
                                                type="file"
                                                accept=".xlsx,.xls"
                                                multiple
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                style={{ display: 'none' }}
                                            />
                                            {selectedFiles.length === 0 ? (
                                                <div className="text-muted">Drag & drop Excel files here or click to upload</div>
                                            ) : (
                                                <div className="d-flex flex-column gap-2 align-items-center">
                                                    {selectedFiles.map((file, index) => (
                                                        <div
                                                            key={index}
                                                            className="d-flex align-items-center justify-content-between w-100 px-3 py-2 border rounded"
                                                            style={{ backgroundColor: '#fff' }}
                                                        >
                                                            <div className="d-flex align-items-center gap-2">
                                                                <Image
                                                                    src="/imgs/Microsoft Excel 2019.png"
                                                                    alt="Excel Icon"
                                                                    width={30}
                                                                    height={40}
                                                                />
                                                                <span className="text-truncate" style={{ maxWidth: '200px' }}>{file.name}</span>
                                                            </div>
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRemoveFile(index);
                                                                }}
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="modal-footer">
                                    <button className="btn btn-success" disabled={loading} onClick={handleProcess}>
                                        {loading ? 'Processing...' : 'Process'}
                                    </button>
                                    <button className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={loading}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showCompleteModal && (
                    <div className="modal show d-block" tabIndex={-1} onClick={() => setShowCompleteModal(false)} style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        height: '100vh',
                        width: '100vw',
                        zIndex: 1050,
                    }}>
                        <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-content text-center">
                                <div className="modal-body py-5">
                                    <h5 className="mb-3">✅ Files processed successfully!</h5>
                                    <button className="btn btn-primary" onClick={() => setShowCompleteModal(false)}>
                                        Done
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {parsedData && pdfUrl && (
                <div className="row">
                    <div className="col-md-12">
                        <div className="mb-3">
                            <label className="form-label">Reference Number</label>
                            <input type="text" className="form-control" value={parsedData.referenceNumber || ''} readOnly />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Customer Name</label>
                            <input type="text" className="form-control" value={parsedData.customerName || ''} readOnly />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Designation</label>
                            <input type="text" className="form-control" value={parsedData.designation || ''} readOnly />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Company Name</label>
                            <input type="text" className="form-control" value={parsedData.companyName || ''} readOnly />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Requirements</label>
                            <textarea className="form-control" rows={4} value={parsedData.requirements || ''} readOnly />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Address</label>
                            <input type="text" className="form-control" value={parsedData.Address || ''} readOnly />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Location</label>
                            <input type="text" className="form-control" value={parsedData.location || ''} readOnly />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Project Scope</label>
                            <textarea
                                className="form-control"
                                rows={6}
                                value={parsedData.ProjectScope?.join('\n\n') || ''}
                                readOnly
                            />
                        </div>
                        <div className="mb-4">
                            <label className="form-label">Solution BOQs</label>
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Qty</th>
                                            <th>Unit Price</th>
                                            <th>Total Cost (Rs.)</th>
                                            <th>Total Tax (NBT)</th>
                                            <th>Social Security Levy</th>
                                            <th>VAT (18%)</th>
                                            <th>Total Cost with Taxes (Rs.)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {parsedData.solutionBOQs?.map((doc, docIndex) =>
                                            doc.items.map((item, itemIndex) => (
                                                <tr key={`${docIndex}-${itemIndex}`}>
                                                    <td>{item.Item}</td>
                                                    <td>{item.Qty || '-'}</td>
                                                    <td>{item["Unit Price"] || '-'}</td>
                                                    <td>{item["Total Cost (Rs.)"] || '-'}</td>
                                                    <td>{item["Total Tax (Rs.): NBT"] || '-'}</td>
                                                    <td>{item["Total cost Social Security Contribution Levy (Rs.)"] || '-'}</td>
                                                    <td>{item["Total Tax (Rs.): 18%VAT"] || '-'}</td>
                                                    <td>{item["Total Cost with Taxes (Rs.)"] || '-'}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>



                        <div className="mb-4">
                            <label className="form-label">Optional Items</label>
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Qty</th>
                                            <th>Unit Price</th>
                                            <th>Total Cost</th>
                                            <th>Tax (NBT)</th>
                                            <th>Tax (SSCL)</th>
                                            <th>Tax (18% VAT)</th>
                                            <th>Total with Taxes</th>
                                            <th>Source</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {parsedData.optionalItems?.flatMap((section: any) =>
                                            section.items?.map((item: any, itemIndex: number) => (
                                                <tr key={`${section.source}-${itemIndex}`}>
                                                    <td>{item["Item"] ?? '-'}</td>
                                                    <td>{item["Qty"] ?? '-'}</td>
                                                    <td>{item["Unit Price"] ?? '-'}</td>
                                                    <td>{item["Total Cost (Rs.)"] ?? '-'}</td>
                                                    <td>{item["Total Tax (Rs.): NBT"] ?? '-'}</td>
                                                    <td>{item["Total Tax (Rs.): VAT"] ?? '-'}</td>
                                                    <td>{item["Total Tax (Rs.): 18%VAT"] ?? '-'}</td>
                                                    <td>{item["Total Cost with Taxes (Rs.)"] ?? '-'}</td>
                                                    <td>{section.source}</td>
                                                </tr>
                                            ))
                                        )}

                                    </tbody>
                                </table>
                            </div>
                        </div>


                        <div className="mb-3">
                            <label className="form-label">Terms and Conditions</label>
                            <textarea
                                className="form-control"
                                rows={6}
                                value={parsedData.termsAndConditions?.join('\n\n') || ''}
                                readOnly
                            />
                        </div>
                    </div>

                    {/* <div className="col-md-6">
                        {pdfUrl && (
                            <iframe
                                src={pdfUrl}
                                width="100%"
                                height="600px"
                                style={{ border: '1px solid #ccc', borderRadius: '8px' }}
                            />
                        )}
                    </div> */}
                </div>

            )}

        </Layout>
    );
};

export default Page;
