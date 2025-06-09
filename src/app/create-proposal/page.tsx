/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Layout from '@/components/Layout';
import Image from 'next/image';
import html2pdf from 'html2pdf.js';


const Page = () => {
    const [showModal, setShowModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>("/template/business-proposal.pdf");
    const [parsedData, setParsedData] = useState<any>(null);
    const [originalData, setOriginalData] = useState(null);
    // const [formData, setFormData] = useState({
    //     referenceNumber: '',
    //     customerName: '',
    //     designation: '',
    //     companyName: '',
    //     requirements: '',
    //     Address: '',
    //     location: '',
    //     ProjectScope: '',
    //     selectedTemplate: '',
    //     uploadedImage: '',
    //     uploadedImageFile: null,
    // });
    const [formData, setFormData] = useState<{
        referenceNumber: string;
        customerName: string;
        designation: string;
        companyName: string;
        requirements: string;
        Address: string;
        location: string;
        ProjectScope: string;
        selectedTemplate: string;
        uploadedImage: string;
        uploadedImageFile: File | null;
    }>({
        referenceNumber: '',
        customerName: '',
        designation: '',
        companyName: '',
        requirements: '',
        Address: '',
        location: '',
        ProjectScope: '',
        selectedTemplate: '',
        uploadedImage: '',
        uploadedImageFile: null,
    });

    const [solutionBOQs, setSolutionBOQs] = useState<any[]>([]);
    const [optionalItems, setOptionalItems] = useState<any[]>([]);
    const [termsAndConditions, setTermsAndConditions] = useState<string[]>([]);



    useEffect(() => {
        if (parsedData) {
            setSolutionBOQs(parsedData.solutionBOQs || []);
            setOptionalItems(parsedData.optionalItems || []);
            setTermsAndConditions(parsedData.termsAndConditions || '');
        }
    }, [parsedData]);





    // useEffect(() => {
    //     if (parsedData) {
    //         setFormData(parsedData);
    //     }
    // }, [parsedData]);


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

    const handleSolutionChange = (docIndex: number, itemIndex: string | number, field: string, value: string) => {
        const updated = [...solutionBOQs];
        updated[docIndex].items[itemIndex][field] = value;
        setSolutionBOQs(updated);
    };
    //     const handleSolutionChange = (
    //     docIndex: number,
    //     itemIndex: number,
    //     field: string,
    //     value: any
    // ) => {
    //     const updated = [...solutionBOQs];
    //     updated[docIndex].items[itemIndex][field] = value;
    //     setSolutionBOQs(updated);
    // };


    const handleOptionalChange = (index: number, field: string, value: string) => {
        const updated = [...optionalItems];
        updated[index][field] = value;
        setOptionalItems(updated);
    };

    const handleTermChange = (index: number, value: string) => {
        const updated = [...termsAndConditions];
        updated[index] = value;
        setTermsAndConditions(updated);
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
            setSolutionBOQs(parsed.solutionBOQs || []);
            setOptionalItems(parsed.optionalItems || []);
            setTermsAndConditions(parsed.termsAndConditions)
            setOriginalData(parsed);
            setFormData(parsed);
            setShowModal(false);
            setShowCompleteModal(true);
        } catch (error) {
            console.error('Error processing files:', error);
            alert('There was an error processing your files.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (typeof window === 'undefined') return;

        const html2pdf = (await import('html2pdf.js')).default;
        const element = document.getElementById('proposal-content');
        if (element) {
            html2pdf()
                .set({
                    margin: 10,
                    filename: 'business-proposal.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                })
                .from(element)
                .save();
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

                    <div className="col-md-6">
                        <button className="btn btn-success" onClick={() => {
                            const updatedData = {
                                ...formData,
                                solutionBOQs: solutionBOQs || [],
                                optionalItems: optionalItems || [],
                                termsAndConditions: termsAndConditions || ''
                            };
                            console.log("Saving data:", updatedData);
                        }}>
                            Save
                        </button>




                        <div className="mb-3">
                            <label className="form-label">Reference Number</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.referenceNumber || ''}
                                onChange={(e) => {
                                    const updated = { ...formData, referenceNumber: e.target.value };
                                    setFormData(updated);
                                    setParsedData({ ...parsedData, ...updated });
                                }}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Customer Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.customerName || ''}
                                onChange={(e) => {
                                    const updated = { ...formData, customerName: e.target.value };
                                    setFormData(updated);
                                    setParsedData({ ...parsedData, ...updated });
                                }}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Designation</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.designation || ''}
                                onChange={(e) => {
                                    const updated = { ...formData, designation: e.target.value };
                                    setFormData(updated);
                                    setParsedData({ ...parsedData, ...updated });
                                }}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Company Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.companyName || ''}
                                onChange={(e) => {
                                    const updated = { ...formData, companyName: e.target.value };
                                    setFormData(updated);
                                    setParsedData({ ...parsedData, ...updated });
                                }}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Requirements</label>
                            <textarea
                                className="form-control"
                                rows={4}
                                value={formData.requirements || ''}
                                onChange={(e) => {
                                    const updated = { ...formData, requirements: e.target.value };
                                    setFormData(updated);
                                    setParsedData({ ...parsedData, ...updated });
                                }}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Address</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.Address || ''}
                                onChange={(e) => {
                                    const updated = { ...formData, Address: e.target.value };
                                    setFormData(updated);
                                    setParsedData({ ...parsedData, ...updated });
                                }}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Location</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.location || ''}
                                onChange={(e) => {
                                    const updated = { ...formData, location: e.target.value };
                                    setFormData(updated);
                                    setParsedData({ ...parsedData, ...updated });
                                }}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Select Template</label>
                            <select
                                className="form-select"
                                value={formData.selectedTemplate || ''}
                                onChange={(e) => setFormData({ ...formData, selectedTemplate: e.target.value })}
                            >
                                <option value="">Choose a Template</option>
                                <option value="Template A">Template A</option>
                                <option value="Template B">Template B</option>
                                <option value="Template C">Template C</option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Upload Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                className="form-control"
                                // onChange={(e) => {
                                //     const file = e.target.files[0];
                                //     if (file) {
                                //         const imageUrl = URL.createObjectURL(file);
                                //         setFormData({ ...formData, uploadedImage: imageUrl, uploadedImageFile: file });
                                //     }
                                // }}
                                onChange={(e) => {
                                    const files = e.target.files;
                                    if (files && files[0]) {
                                        const file = files[0];
                                        const imageUrl = URL.createObjectURL(file);
                                        setFormData({ ...formData, uploadedImage: imageUrl, uploadedImageFile: file });
                                    }
                                }}

                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Project Scope</label>
                            <textarea
                                className="form-control"
                                rows={4}
                                value={formData.ProjectScope || ''}
                                onChange={(e) => {
                                    const updated = { ...formData, ProjectScope: e.target.value };
                                    setFormData(updated);
                                    setParsedData({ ...parsedData, ...updated });
                                }}
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
                                        <tbody>
                                            {solutionBOQs?.flatMap((doc, i) =>
                                                doc.items?.map((item: { [x: string]: string | number | readonly string[] | undefined; Item: string | number | readonly string[] | undefined; Qty: any; }, index: any) => (
                                                    <tr key={`${i}-${index}`}>
                                                        <td><input value={item.Item} onChange={e => handleSolutionChange(i, index, 'Item', e.target.value)} /></td>
                                                        <td><input value={item.Qty ?? ''} onChange={e => handleSolutionChange(i, index, 'Qty', e.target.value)} /></td>
                                                        <td><input value={item["Unit Price"]} onChange={e => handleSolutionChange(i, index, 'Unit Price', e.target.value)} /></td>
                                                        <td><input value={item["Total Cost (Rs.)"]} onChange={e => handleSolutionChange(i, index, 'Total Cost (Rs.)', e.target.value)} /></td>
                                                        <td><input value={item["Total Tax (Rs.): NBT"] ?? ''} onChange={e => handleSolutionChange(i, index, 'Total Tax (Rs.): NBT', e.target.value)} /></td>
                                                        <td><input value={item["Total cost Social Security Contribution Levy (Rs.)"] ?? ''} onChange={e => handleSolutionChange(i, index, 'Total cost Social Security Contribution Levy (Rs.)', e.target.value)} /></td>
                                                        <td><input value={item["Total Tax (Rs.): 18%VAT"] ?? ''} onChange={e => handleSolutionChange(i, index, 'Total Tax (Rs.): 18%VAT', e.target.value)} /></td>
                                                        <td><input value={item["Total Cost with Taxes (Rs.)"]} onChange={e => handleSolutionChange(i, index, 'Total Cost with Taxes (Rs.)', e.target.value)} /></td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>

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
                                        <tbody>
                                            {optionalItems?.map((item, index) => (
                                                <tr key={index}>
                                                    <td><input value={item.Item} onChange={e => handleOptionalChange(index, 'Item', e.target.value)} /></td>
                                                    <td><input value={item.Qty} onChange={e => handleOptionalChange(index, 'Qty', e.target.value)} /></td>
                                                    <td><input value={item["Unit Price"] ?? ''} onChange={e => handleOptionalChange(index, 'Unit Price', e.target.value)} /></td>
                                                    <td><input value={item["Total Cost (Rs.)"]} onChange={e => handleOptionalChange(index, 'Total Cost (Rs.)', e.target.value)} /></td>
                                                    <td><input value={item["Total Tax (Rs.): NBT"]} onChange={e => handleOptionalChange(index, 'Total Tax (Rs.): NBT', e.target.value)} /></td>
                                                    <td><input value={item["Total Tax (Rs.): SSCL"] ?? ''} onChange={e => handleOptionalChange(index, 'Total Tax (Rs.): SSCL', e.target.value)} /></td>
                                                    <td><input value={item["Total Tax (Rs.): VAT"]} onChange={e => handleOptionalChange(index, 'Total Tax (Rs.): VAT', e.target.value)} /></td>
                                                    <td><input value={item["Total Cost with Taxes (Rs.)"]} onChange={e => handleOptionalChange(index, 'Total Cost with Taxes (Rs.)', e.target.value)} /></td>
                                                    <td><input value={item.source ?? ''} onChange={e => handleOptionalChange(index, 'source', e.target.value)} /></td>
                                                </tr>
                                            ))}
                                        </tbody>


                                    </tbody>
                                </table>
                            </div>
                        </div>


                        <div className="mb-3">
                            <label className="form-label">Terms and Conditions</label>
                            <ul>
                                {termsAndConditions?.map((term, index) => (
                                    <li key={index}>
                                        <input
                                            value={term}
                                            onChange={(e) => handleTermChange(index, e.target.value)}
                                            style={{ width: '100%' }}
                                        />
                                    </li>
                                ))}
                            </ul>

                        </div>
                    </div>

                    <div className="col-md-6">
                        {parsedData && (
                            <>
                                <div id="proposal-content" style={{ padding: '30px', fontFamily: 'Arial' }}>
                                    <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Business Proposal</h2>

                                    <p><strong>Reference Number:</strong> {formData.referenceNumber || ''}</p>
                                    <p><strong>Customer Name:</strong> {formData.customerName}</p>
                                    <p><strong>Designation:</strong> {formData.designation ?? 'N/A'}</p>
                                    <p><strong>Company Name:</strong> {formData.companyName ?? 'N/A'}</p>
                                    <p><strong>Address:</strong> {formData.Address ?? 'N/A'}</p>
                                    <p><strong>Location:</strong> {formData.location}</p>

                                    <h4>Requirements</h4>
                                    <p>{formData.requirements ?? 'Not specified'}</p>

                                    <h4>Project Scope</h4>
                                    <ul>
                                        {(Array.isArray(parsedData.ProjectScope) ? parsedData.ProjectScope : [parsedData.ProjectScope])?.map((point: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined, index: React.Key | null | undefined) => (
                                            <li key={index}>{point}</li>
                                        ))}
                                    </ul>
                                    {formData.uploadedImage && (
                                        <div className="mb-3">
                                            <label className="form-label">Image Preview</label>
                                            <Image
                                                src={formData.uploadedImage}
                                                alt="Uploaded"
                                                className="img-thumbnail"
                                                width={300}
                                                height={300}
                                                style={{ maxWidth: '100%', maxHeight: '300px' }}
                                            />
                                        </div>
                                    )}
                                    <h4>Solution BOQs</h4>
                                    <table border={1} cellPadding={6} cellSpacing={0} width="100%">
                                        <thead>
                                            <tr>
                                                <th>Item</th><th>Qty</th><th>Unit Price</th><th>Total</th>
                                                <th>NBT</th><th>SSCL</th><th>VAT</th><th>Total with Taxes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {parsedData.solutionBOQs?.flatMap((doc: { items: any[]; }, i: any) =>
                                                doc.items?.map((item: { [x: string]: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; Item: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; Qty: any; }, index: any) => (
                                                    <tr key={`${i}-${index}`}>
                                                        <td>{item.Item}</td>
                                                        <td>{item.Qty ?? 'N/A'}</td>
                                                        <td>{item["Unit Price"]}</td>
                                                        <td>{item["Total Cost (Rs.)"]}</td>
                                                        <td>{item["Total Tax (Rs.): NBT"] ?? 'N/A'}</td>
                                                        <td>{item["Total cost Social Security Contribution Levy (Rs.)"] ?? 'N/A'}</td>
                                                        <td>{item["Total Tax (Rs.): 18%VAT"] ?? 'N/A'}</td>
                                                        <td>{item["Total Cost with Taxes (Rs.)"]}</td>
                                                    </tr>
                                                )) ?? []
                                            )}
                                        </tbody>
                                    </table>

                                    <h4>Optional Items</h4>
                                    <table border={1} cellPadding={6} cellSpacing={0} width="100%">
                                        <thead>
                                            <tr>
                                                <th>Item</th><th>Qty</th><th>Unit Price</th><th>Total</th>
                                                <th>NBT</th><th>SSCL</th><th>VAT</th><th>Total with Taxes</th><th>Source</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {parsedData.optionalItems?.map((item: { [x: string]: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; Item: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; Qty: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; source: any; }, index: React.Key | null | undefined) => (
                                                <tr key={index}>
                                                    <td>{item.Item}</td>
                                                    <td>{item.Qty}</td>
                                                    <td>{item["Unit Price"] ?? 'N/A'}</td>
                                                    <td>{item["Total Cost (Rs.)"]}</td>
                                                    <td>{item["Total Tax (Rs.): NBT"]}</td>
                                                    <td>{item["Total Tax (Rs.): SSCL"] ?? 'N/A'}</td>
                                                    <td>{item["Total Tax (Rs.): VAT"]}</td>
                                                    <td>{item["Total Cost with Taxes (Rs.)"]}</td>
                                                    <td>{item.source ?? 'N/A'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <h4>Terms and Conditions</h4>
                                    <ul>
                                        {termsAndConditions?.map((term: string, index: number) => (
                                            <li key={index}>{term}</li>
                                        )) ?? <li>No terms specified.</li>}
                                    </ul>

                                </div>
                                <div style={{ marginTop: '20px' }}>
                                    <button className="btn btn-primary" onClick={handleDownloadPDF}>
                                        Download Proposal as PDF
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

            )}
        </Layout>
    );
};

export default Page;
