import React, { useState, useRef, useEffect } from 'react'
import { fabric } from 'fabric'; // this also installed on your project
// import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react'
import './index.css'
import './App.css'

const markArray = [
    // 'https://img2.momoshop.com.tw/ecm/img/online/10/007/02/524/images/btn_guide.png?t=1655470084067',
    // 'https://img1.momoshop.com.tw/ecm/img/xiaoi/momoco_pc1.png?ver=20161206174501',
    './images/team-1.png',
    './images/team-2.png',
    './images/team-3.png',
]
function App() {
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const canvasFinalRef = useRef(null)
    const [fabricAPI, setFabricAPI] = useState(null)
    const [imageUrl, setImageUrl] = useState('')
    const [imagePreview, setImagePreview] = useState('')
    const [showResult, setShowResult] = useState(false)
    const [startTakePhoto, setStartTakePhoto] = useState(false)
    const [loading, setLoading] = useState(true)
    const [currentHeight, setCurrentHeight] = useState(0)
    const [currentWidth, setCurrentWidth] = useState(0)

    useEffect(() => {
        initDeviceSize()
        const canvas = new fabric.Canvas(canvasFinalRef.current)
        setFabricAPI(canvas)
        window.canvasAPI = canvas
    }, [])

    const setCurrentDimensions = () => {
        fabricAPI.setWidth(currentWidth || 0)
        fabricAPI.setHeight(currentHeight || 0)
        fabricAPI.renderAll()
    }
    const initDeviceSize = () => {
        setCurrentWidth(window.screen.width)
        setCurrentHeight(window.screen.height - 150)
    }
    const handleResetClicked = () => {
        setShowResult(false)
        setImageUrl('')
        emptySecondItem()
        fabricAPI.clear()
    }
    const handleStartCameraClicked = () => {
        setStartTakePhoto(true)
        setTimeout(() => {
            startStreamedVideo()
        }, 200);
    }
    const handleTakePhotoClicked = () => {
        const imageCanvas = canvasRef.current
        const imageCanvasContext = imageCanvas.getContext("2d")
        imageCanvasContext.drawImage(
            videoRef.current,
            0,
            0,
            currentWidth,
            currentHeight
        );
        const image = imageCanvas.toDataURL("image/png")
        setImageUrl(image)
        imageInsertToCanvas({ selectable: 0, src: image, left: 0, top: 0 })
        setShowResult(true)
        setCurrentDimensions();
    }
    const startStreamedVideo = () => {
        const constraints = {
            video: {
                width: currentWidth,
                height: currentHeight
            }
        };
        const videoElement = videoRef.current
        navigator.mediaDevices
            .getUserMedia(constraints)
            .then(stream => {
                console.log(stream);
                setLoading(false)
                videoElement.srcObject = stream;
                videoElement.onloadedmetadata = e => {
                    videoElement.play();
                };
            })
            .catch(error => {
                console.log('error: ', error);
                alert(error.name);
            });
    }

    // ------- test 2 image
    const fileRef = useRef(null)
    const fileRef2 = useRef(null)
    const imageInsertToCanvas = ({ selectable, src, ...options }) => {
        const img = new Image();
        img.onload = function() {
            const imgInstance = new fabric.Image(img, {
                selectable,
                ...options
            })
            fabricAPI.add(imgInstance)
            fabricAPI.renderAll();
        }
        img.crossOrigin = "Anonymous";
        img.src = src;
        img.style.width = '100px'
        img.style.height = '100px'
    }
    const handleFileUploaded = () => {
        const [file] = fileRef.current.files
        if (file) {
            const previewImg = URL.createObjectURL(file)
            imageInsertToCanvas({ selectable: 0, src: previewImg })
        }
    }
    const handleFile2Uploaded = () => {
        const [file] = fileRef2.current.files
        emptySecondItem()
        if (file) {
            const previewImg = URL.createObjectURL(file)
            imageInsertToCanvas({ selectable: 1, src:
                previewImg
                // "https://img2.momoshop.com.tw/ecm/img/online/10/007/02/524/images/btn_guide.png?t=1655470084067"
                // "https://media.etmall.com.tw/nximg/003500/3500603/3500603_ml.jpg?t=18364098185"
            })
        }
    }
    const renderImage = () => {
        const finalImage = editor.canvas.toDataURL('image/png')
        setImagePreview(finalImage)
    }
    const emptySecondItem = () => {
        try {
            fabricAPI.setActiveObject(fabricAPI.item(1))
            fabricAPI.remove(fabricAPI.getActiveObject())
        } catch (error) {
            console.log(error);
        }
    }
    const handleTopImageClick = imageUrl => () => {
        emptySecondItem()
        imageInsertToCanvas({
            selectable: 1,
            src: imageUrl,
            left: 50,
            top: 50,
            // width: 50,
            // height: 50
        })
    }
    const handleSaveImageClicked = () => {
        const finalImage = fabricAPI.toDataURL('image/png')
        const a = document.createElement('a')
        a.href = finalImage
        a.download = `${new Date().getTime()}-canvas`
        a.click()
    }

    /*
    return (
        <div>
            <input type="file" id="file" ref={fileRef} onChange={handleFileUploaded} />
            <input type="file" id="file2" ref={fileRef2} onChange={handleFile2Uploaded} />
            <canvas ref={canvasFinalRef}></canvas>
            <button onClick={renderImage}>render image</button>
            {// <button onClick={removeFn}>remove</button>}
            <img src={imagePreview} alt="" />
        </div>
    )
    */

    // ------- test 2 image
    return (
        <div className="App">
            {
                startTakePhoto
                    ? (
                        <div className="wrap">
                            <video
                                ref={videoRef}
                                preload="true"
                                autoPlay
                                playsInline
                                loop
                                muted
                                width={currentWidth}
                                height={currentHeight}
                                style={{ display: startTakePhoto ? 'inline' : 'none', }}
                            ></video>
                            {
                                loading
                                    ? <div className="loading">Loading...</div>
                                    : <div className="cameraShutter" onClick={handleTakePhotoClicked}></div>
                            }
                            <canvas
                                ref={canvasRef}
                                width={currentWidth}
                                height={currentHeight}
                                style={{ display: 'none', }}
                            ></canvas>
                        </div>
                    )
                    : <div className="startCameraBtn"><button onClick={handleStartCameraClicked}>開始拍照</button></div>
            }
            <div className={`result ${showResult ? 'showResult' : ''}`}>
                <div className='imgWrap'>
                    {markArray.map((img, idx) => <img key={idx} src={img} onClick={handleTopImageClick(img)} />)}
                </div>
                <div style={{ position: 'relative', height: currentHeight, width: currentWidth }}>
                    <canvas ref={canvasFinalRef}></canvas>
                </div>
                <button className="undo" onClick={handleResetClicked}>重拍</button>
                <button className="undo" onClick={handleSaveImageClicked}>儲存</button>
            </div>
        </div>
    )
}

export default App
