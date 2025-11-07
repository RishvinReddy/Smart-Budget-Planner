import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { useBudgetState, useBudgetDispatch } from '../hooks/useBudget';
import { CategoryType, Item } from '../types';
import { Upload, Camera, Sparkles, X, Loader2, CheckCircle } from 'lucide-react';

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

const CameraModal: React.FC<{ isOpen: boolean; onClose: () => void; onCapture: (file: File) => void; }> = ({ isOpen, onClose, onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        const startCamera = async () => {
            if (isOpen && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    streamRef.current = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                } catch (err) {
                    console.error("Error accessing camera: ", err);
                    alert("Could not access the camera. Please ensure permissions are granted.");
                    onClose();
                }
            }
        };

        const stopCamera = () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };

        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
        }

        return () => stopCamera();
    }, [isOpen, onClose]);

    const handleCaptureClick = () => {
        const video = videoRef.current;
        if (video) {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(blob => {
                if (blob) {
                    const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
                    onCapture(file);
                }
            }, 'image/jpeg');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white p-4 rounded-lg max-w-lg w-full">
                <video ref={videoRef} autoPlay playsInline className="w-full rounded-md"></video>
                <div className="mt-4 flex justify-center gap-4">
                    <button onClick={handleCaptureClick} className="px-4 py-2 bg-brand-purple text-white rounded-md">Capture</button>
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-md">Cancel</button>
                </div>
            </div>
        </div>
    );
};


interface AnalysisResult {
    vendor: string;
    totalAmount: number;
    transactionDate: string;
    suggestedCategoryName: string;
    location: string;
    items?: Item[];
}

const ImageAnalyzer: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const [isCameraOpen, setIsCameraOpen] = useState(false);
    
    const budgetState = useBudgetState();
    const dispatch = useBudgetDispatch();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const allCategoryItems = useMemo(() => [
        ...budgetState.income.map(i => ({ id: i.id, name: i.name, type: CategoryType.Income })),
        ...budgetState.bills.map(i => ({ id: i.id, name: i.name, type: CategoryType.Bills })),
        ...budgetState.expenses.map(i => ({ id: i.id, name: i.name, type: CategoryType.Expenses })),
        ...budgetState.savings.map(i => ({ id: i.id, name: i.name, type: CategoryType.Savings })),
        ...budgetState.debt.map(i => ({ id: i.id, name: i.name, type: CategoryType.Debt })),
    ], [budgetState]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };
    
    const handleFile = (file: File) => {
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setAnalysisResult(null);
        setError(null);
        setIsSuccess(false);
    };

    const clearImage = () => {
        setImageFile(null);
        setPreviewUrl(null);
        setAnalysisResult(null);
        setError(null);
        setIsSuccess(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleAnalyze = async () => {
        if (!imageFile) return;

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const categoryNames = allCategoryItems.map(c => c.name);

            const imagePart = await fileToGenerativePart(imageFile);
            const textPart = {
                text: `Analyze the receipt in the image. Extract the vendor name, total amount, transaction date, and the full street address of the vendor if available. Also extract an itemized list of products and their prices. Finally, suggest the most relevant overall category for this purchase from this list: ${JSON.stringify(categoryNames)}. The current year is ${new Date().getFullYear()}. If the year is not specified on the receipt, assume it's the current year. If an itemized list is not clear or available, return an empty array for items.`
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, textPart] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            vendor: { type: Type.STRING, description: 'The name of the vendor or store.' },
                            totalAmount: { type: Type.NUMBER, description: 'The final total amount of the transaction.' },
                            transactionDate: { type: Type.STRING, description: 'The date of the transaction in YYYY-MM-DD format.' },
                            suggestedCategoryName: { type: Type.STRING, description: 'The suggested overall category name from the provided list.' },
                            location: { type: Type.STRING, description: 'The street address of the vendor. Return an empty string if not found.'},
                            items: {
                                type: Type.ARRAY,
                                description: 'An itemized list of products and their prices. Can be empty.',
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        description: { type: Type.STRING, description: 'The name or description of the item.' },
                                        amount: { type: Type.NUMBER, description: 'The price of the item.' }
                                    },
                                    required: ['description', 'amount']
                                }
                            }
                        },
                        required: ['vendor', 'totalAmount', 'transactionDate', 'suggestedCategoryName', 'location', 'items']
                    }
                }
            });
            
            const resultText = response.text;
            const parsedResult = JSON.parse(resultText);
            setAnalysisResult(parsedResult);

        } catch (e) {
            console.error(e);
            setError("Failed to analyze the image. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddTransactionFromAnalysis = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        const selectedCategory = allCategoryItems.find(c => c.id === data.category);
        if (!selectedCategory || !analysisResult) {
            setError("Please select a valid category.");
            return;
        }

        dispatch({
            type: 'ADD_TRANSACTION',
            payload: {
                date: data.date as string,
                description: data.description as string,
                amount: parseFloat(data.amount as string),
                categoryId: selectedCategory.id,
                categoryType: selectedCategory.type,
                location: data.location as string,
                items: analysisResult.items,
            },
        });

        setIsSuccess(true);
        setTimeout(clearImage, 2000);
    };
    
    const handleCameraCapture = (file: File) => {
        handleFile(file);
        setIsCameraOpen(false);
    };

    return (
        <div className="space-y-4">
            {!previewUrl && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-brand-purple-light text-brand-purple-dark font-semibold rounded-lg hover:bg-opacity-80 transition-colors">
                        <Upload size={20} /> Upload Receipt
                    </button>
                    <button onClick={() => setIsCameraOpen(true)} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-brand-purple-light text-brand-purple-dark font-semibold rounded-lg hover:bg-opacity-80 transition-colors">
                        <Camera size={20} /> Scan with Camera
                    </button>
                </div>
            )}

            {previewUrl && (
                <div className="relative w-full max-w-sm mx-auto">
                    <img src={previewUrl} alt="Receipt preview" className="rounded-lg w-full h-auto" />
                    <button onClick={clearImage} className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 hover:bg-red-500 transition-colors">
                        <X size={16} />
                    </button>
                </div>
            )}
            
            {imageFile && !analysisResult && !isLoading && (
                 <button onClick={handleAnalyze} disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-purple-dark text-white font-bold rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-gray-400">
                    <Sparkles size={20} /> Analyze with Gemini
                </button>
            )}

            {isLoading && (
                <div className="flex justify-center items-center gap-3 text-gray-600">
                    <Loader2 className="animate-spin" size={24} />
                    <p className="font-semibold">Analyzing your receipt...</p>
                </div>
            )}

            {error && <p className="text-red-600 text-center font-medium">{error}</p>}
            
            {isSuccess && (
                <div className="flex justify-center items-center gap-3 text-green-600 bg-green-100 p-3 rounded-lg">
                    <CheckCircle size={24} />
                    <p className="font-semibold">Transaction added successfully!</p>
                </div>
            )}

            {analysisResult && !isSuccess && (
                <form onSubmit={handleAddTransactionFromAnalysis} className="p-4 bg-gray-50 rounded-lg space-y-4">
                    <h3 className="text-lg font-bold text-gray-700">Confirm Transaction</h3>
                    
                    {analysisResult.items && analysisResult.items.length > 0 && (
                        <div>
                             <label className="block text-sm font-medium text-gray-700">Scanned Items</label>
                             <div className="mt-1 bg-white border rounded-md max-h-32 overflow-y-auto">
                                 <table className="w-full text-sm">
                                     <tbody>
                                         {analysisResult.items.map((item, index) => (
                                             <tr key={index} className="border-b">
                                                 <td className="px-2 py-1">{item.description}</td>
                                                 <td className="px-2 py-1 text-right font-mono">{item.amount.toFixed(2)}</td>
                                             </tr>
                                         ))}
                                     </tbody>
                                 </table>
                             </div>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <input type="text" id="description" name="description" defaultValue={analysisResult.vendor} required className="input-field mt-1" />
                        </div>
                         <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Total Amount</label>
                            <input type="number" id="amount" name="amount" defaultValue={analysisResult.totalAmount} required step="0.01" className="input-field mt-1" />
                        </div>
                         <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                            <input type="text" id="location" name="location" defaultValue={analysisResult.location} className="input-field mt-1" />
                        </div>
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                            <input type="date" id="date" name="date" defaultValue={analysisResult.transactionDate} required className="input-field mt-1" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Suggested Category</label>
                        <select id="category" name="category" defaultValue={allCategoryItems.find(c => c.name === analysisResult.suggestedCategoryName)?.id} required className="input-field mt-1">
                            <option value="" disabled>Select a category</option>
                            {allCategoryItems.map(item => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700">Add Transaction</button>
                </form>
            )}
            <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleCameraCapture} />
            <style>{`.input-field { display: block; width: 100%; padding: 0.5rem; border-radius: 0.375rem; border: 1px solid #D1D5DB; } .input-field:focus { outline: 2px solid #A482FF; }`}</style>
        </div>
    );
};

export default ImageAnalyzer;