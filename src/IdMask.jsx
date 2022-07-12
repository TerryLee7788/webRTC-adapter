import React, { useState, useRef, useEffect } from 'react'
import Tesseract, { createWorker } from 'tesseract.js'
import './index.css'
import './App.css'
import './idMask.css'

// 截圖圖片大小
const clipImage = {
    width: 135,
    height: 25
}

function IdMask() {
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const fileRef = useRef(null)
    const imagePreviewRef = useRef(null)
    const [imageUrl, setImageUrl] = useState('')
    const [imagePreview, setImagePreview] = useState('')
    const [userId, setUserId] = useState('')
    const [showResult, setShowResult] = useState(false)
    const [startTakePhoto, setStartTakePhoto] = useState(false)
    const [showMask, setShowMask] = useState(false)
    const [loading, setLoading] = useState(true)
    const [currentHeight, setCurrentHeight] = useState(0)
    const [currentWidth, setCurrentWidth] = useState(0)

    useEffect(() => {
        initDeviceSize()
    }, [])

    // useEffect(() => {
    //     if (imagePreview !== '') setTimeout(handleAnalyzeClicked, 10);
    // }, [imagePreview])

    const initDeviceSize = () => {
        setCurrentWidth(window.screen.width)
        setCurrentHeight(window.screen.height - 150)
    }
    const handleResetClicked = () => {
        setShowResult(false)
        setImageUrl('')
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
        const position = 40
        const imageWidth = imagePreviewRef.current.width
        const imageHeight = imagePreviewRef.current.height
        console.log(`👊👊👊 idMask.jsx 👊👊👊 -- ✍ 第56行 ✍ imageWidth: `, imageWidth);
        imageCanvasContext.drawImage(
            imagePreviewRef.current,
            // 圖片座標 + 圖片大小
            position,
            position,
            imageWidth - position * 2,
            imageHeight - position,
            // canvas 輸出座標 + canvas 圖片大小
            0,
            0,
            imageWidth - 200,
            imageHeight - position,
        );
        const image = imageCanvas.toDataURL("image/png")
        setImageUrl(image)
        setShowResult(true)
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
                    setShowMask(true)
                };
            })
            .catch(error => {
                console.log(error);
                // alert(error.name);
            });
    }
    const handleAnalyzeClicked = () => {
        console.log('開始分析...');
        // 測試 身分證裁切 + 身分證 Tesseract 辨識
        const imageCanvas = canvasRef.current
        const imageCanvasContext = imageCanvas.getContext("2d")
        const imageWidth = imagePreviewRef.current.width
        const imageHeight = imagePreviewRef.current.height
        // const imageWidth = videoRef.current.width
        // const imageHeight = videoRef.current.height

        // 圖片裁切: 比例計算有問題!!
        const clipImageSetting = {
            imageInfo: {
                x: imageWidth - 82,
                y: imageHeight - 3,
                imageWidth: clipImage.width,
                imageHeight: clipImage.height
                // x: imageWidth - (imageWidth*.22),
                // y: imageHeight - (imageHeight*.025),
                // imageWidth: imageWidth*.20,
                // imageHeight: imageHeight*.03
            },
            canvasInfo: {
                x: 0,
                y: 0,
                imageWidth: clipImage.width,
                imageHeight: clipImage.height
                // imageWidth: imageWidth,
                // imageHeight: imageHeight
            }
        }
        const { imageInfo, canvasInfo } = clipImageSetting
        // debugger
        imageCanvasContext.drawImage(
            // videoRef.current,
            imagePreviewRef.current,

            // 圖片座標 + 圖片大小
            imageInfo.x,
            imageInfo.y,
            imageInfo.imageWidth,
            imageInfo.imageHeight,

            // canvas 輸出座標 + canvas 圖片大小
            canvasInfo.x,
            canvasInfo.y,
            canvasInfo.imageWidth,
            canvasInfo.imageHeight,
        );
        const image = imageCanvas.toDataURL("image/png")
        Tesseract.recognize(image, 'eng', {
            logger: m => {
                if (m.status === 'recognizing text') {
                    console.log('m: ', parseInt(m.progress * 100));
                }
            }
        })
        .then(result => {
            console.log('result: ', result);
            console.log('text: ', result.data.text);
            setUserId(result.data.text)
        })
        .catch(err => {
            console.log('err: ', err);
        })
        setImageUrl(image)
    }
    const handleFileUploaded = e => {
        const [file] = fileRef.current.files
        if (file) {
            const previewImg = URL.createObjectURL(file)
            setImagePreview(previewImg)
        }
    }
    // 測試 身分證裁切 + 身分證 Tesseract 辨識
    return (
        <div>
            <canvas
                ref={canvasRef}
                width={clipImage.width}
                height={clipImage.height}
                style={{ display: 'none', }}
            ></canvas>
            <img ref={imagePreviewRef} src={imagePreview} />
            <input type="file" id="file" ref={fileRef} onChange={handleFileUploaded} />
            <div className='file-upload-container m-1'>
                <label htmlFor="file"><span className="btn btn-success">圖片分析</span></label>
                {
                    imagePreview
                        ? <div className="btn btn-danger analyze-btn" onClick={handleAnalyzeClicked}>開始分析</div>
                        : null
                }
            </div>
            {
                userId
                    ? <div className="user-id m-1">您的身分證為：<span style={{ color: 'red' }}>{userId}</span></div>
                    : null
            }
            <div><img className="m-1" src={imageUrl} /></div>
        </div>
    )
    const testSvg = false

    return (
        <div className="App">
            {
                startTakePhoto
                    ? (
                        <div className="wrap">
                            <div className="video-wrap">
                                {
                                    showMask &&
                                        <>
                                        {
                                            testSvg
                                                ? (
                                                    <svg className="mask" viewBox="0 0 100 150">
                                                        <path fill="none" d="M25 0, L0, 0, L0, 25" stroke="rgba(255, 0, 0, 0.6)" strokeWidth="4"></path>
                                                        <path fill="none" d="M0 125, L0, 150, L25, 150" stroke="rgba(255, 0, 0, 0.6)" strokeWidth="4"></path>
                                                        <path fill="none" d="M75 150, L100, 150, L100, 125" stroke="rgba(255, 0, 0, 0.6)" strokeWidth="4"></path>
                                                        <path fill="none" d="M75 0, L100, 0, L100, 25" stroke="rgba(255, 0, 0, 0.6)" strokeWidth="4"></path>
                                                    </svg>
                                                )
                                                : (
                                                    <>
                                                        <div className="square left-square"></div>
                                                        <div className="square right-square"></div>
                                                    </>
                                                )
                                        }
                                        </>
                                }
                                <video
                                    className="video scale"
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
                            </div>
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
                <div className='preview'><img ref={imagePreviewRef} className='scale' src={imageUrl} /></div>
                <div className="undo">
                    <button className="undo-btn" onClick={handleResetClicked}>重拍</button>
                    <button onClick={handleAnalyzeClicked}>開始分析</button>
                </div>
            </div>
        </div>
    )
}

export default IdMask
