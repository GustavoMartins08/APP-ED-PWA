import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, Maximize, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from './ui/button';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configurar o worker do PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

interface PDFReaderProps {
    url: string;
}

const PDFReader: React.FC<PDFReaderProps> = ({ url }) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // Swipe threshold
    const minSwipeDistance = 50;

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setPageNumber(1);
    };

    const changePage = (offset: number) => {
        setPageNumber((prevPageNumber) => {
            const newPage = prevPageNumber + offset;
            return Math.min(Math.max(newPage, 1), numPages || 1);
        });
    };

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && pageNumber < (numPages || 0)) {
            changePage(1);
        }
        if (isRightSwipe && pageNumber > 1) {
            changePage(-1);
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-100">

            {/* Toolbar */}
            <div className="w-full bg-white border-b border-gray-200 p-3 flex items-center justify-between z-10 sticky top-0">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Página {pageNumber} de {numPages || '--'}
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-xs w-10 text-center">{Math.round(scale * 100)}%</span>
                    <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.min(2.0, s + 0.1))}>
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* PDF Viewport */}
            <div
                className="w-full overflow-auto flex justify-center bg-gray-500/5 min-h-[50vh] relative"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                        <div className="flex items-center justify-center h-64 w-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                        </div>
                    }
                    error={
                        <div className="flex flex-col items-center justify-center h-64 text-red-500 gap-2">
                            <p>Erro ao carregar PDF.</p>
                            <Button variant="outline" size="sm" onClick={() => window.open(url, '_blank')}>
                                Abrir Externamente
                            </Button>
                        </div>
                    }
                    className="shadow-2xl my-4 md:my-8"
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        renderAnnotationLayer={true}
                        renderTextLayer={false}
                        className="bg-white shadow-lg"
                        width={window.innerWidth > 768 ? 600 : window.innerWidth - 32}
                    />
                </Document>

                {/* Navigation Overlays (Hidden on mobile touch but available for click) */}
                <button
                    className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-opacity ${pageNumber <= 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    onClick={() => changePage(-1)}
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>

                <button
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-opacity ${pageNumber >= (numPages || 0) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    onClick={() => changePage(1)}
                >
                    <ChevronRight className="h-6 w-6" />
                </button>
            </div>

            {/* Mobile Tip */}
            <div className="w-full bg-white border-t border-gray-200 p-2 text-center md:hidden">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">Deslize para mudar de página</span>
            </div>
        </div>
    );
};

export default PDFReader;
