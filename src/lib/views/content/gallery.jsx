import { Application } from '../../index';

import { CloseButtonComponent } from '../close.jsx!';
import { TimelineBackgroundComponent, TimelineEvents } from '../timeline.jsx!';
import { DataEvents, Data } from '../../data/data';
import { Preload, PreloadEvents, PreloadConst } from '../../emitters/staticAssets';
import { MainEvents } from '../../main.jsx!';

import React from 'react';
import marked from 'marked';

import easeljs from 'easeljs';
import tweenjs from 'tweenjs';
import key from 'keymaster';


export class GalleryContentComponent extends React.Component {
    constructor(){
        super();
        let ratioConst = 1.7777778;
        this.preload = new Preload();
        this._data = Data.result;
        this.currentIndex = 0;
        this.handleDotClick = _.bind(this.handleDotClick, this);
        this.handleOnClick = this.handleOnClick.bind(this);
        this.state = {
            state: "off",
            imageCaption: "",
            canvasHeight: (window.innerHeight*.6),
            canvasWidth: (window.innerHeight*.6)*1.7777778,
            imagesRaw: [],
            currentIndex: this.currentIndex
        }
        window.addEventListener('resize', _.bind(this.handleWindowResize, this));
        this.assignEvents();
    }
    get data(){
        return this._data;
    }
    set data(obj){
        this._data = obj;
        if(!this._data) this.attachDataEventHandler();
    }

    componentWillMount(){
        key('esc', ()=>{
            this.isActive = false;
            return window.location.hash = "#/timeline"
        })
        key('right', ()=>{
            this.nextImage();
        });
        key('left', ()=>{
            this.prevImage();
        });
    }

    assignEvents(){
        Application.pipe.on(PreloadEvents.COMPLETE, _.bind(this.handlePreloadComplete, this));
        Application.pipe.on(PreloadEvents.PROGRESS, _.bind(this.handlePreloadProgress, this));
    }

    attachDataEventHandler(){
        Application.pipe.on(DataEvents.UPDATE, _.bind(this.handleData, this));
    }

    handleData(data){
        this.setState(data);
    }

    nextImage(){
        this.clear();
        if(this.currentIndex+1 < this.totalLength){
            this.currentIndex = this.currentIndex+1
        }else{
            this.currentIndex = 0;
        }
        this.setState({
            currentIndex: this.currentIndex
        });
        this.addBitMapToStage(this.state.imagesRaw[this.currentIndex]);
    }

    clear(){
        if(this.props.data.type === "factoid"){
            if(this.stage){
                this.stage.removeAllChildren();
            }

        }
    }

    prevImage(){
        this.clear();
        if(this.currentIndex-1 > -1){
            this.currentIndex = this.currentIndex-1
        }else{
            this.currentIndex = this.totalLength-1;
        }
        this.setState({
            currentIndex: this.currentIndex
        });
        this.addBitMapToStage(this.state.imagesRaw[this.currentIndex]);
    }

    handleDotClick(event){
        this.clear();
        var index = event.target.getAttribute('data-index');
        this.currentIndex = parseInt(index);
        this.setState({
            currentIndex: this.currentIndex
        });
        this.addBitMapToStage(this.state.imagesRaw[this.currentIndex]);
    }
    handlePreloadProgress(progress){
        this.setState({
            progress: progress
        })

    }
    handlePreloadComplete(event){
        if(!this.images) return;
        let imagesArray = [];
        this.images.forEach((image)=>{
            imagesArray.push(this.preload.preload.getResult(image.src));
        })
        this.setState({
            imagesRaw: imagesArray,
            ready: "ready"
        });
        this.totalLength = imagesArray.length;
        this.addBitMapToStage(imagesArray[this.currentIndex]);


    }

    handleWindowResize(){
        this.setState({
            canvasHeight: (window.innerHeight*.6),
            canvasWidth: (window.innerHeight*.6)*1.7777778
        });
        if(this.stage){
            this.stage.update();
        }

    }


    /**
     * Handles control for images being added to stage and applies filters
     * @param image
     * @returns {boolean}
     */
    addBitMapToStage(image){
        if(!image)return
        var img = new createjs.Bitmap(image);
        //img.alpha = 1;
        //createjs.Tween.get(img).to({alpha:1}, 0);
        img.scaleX = this.state.canvasWidth / image.width;
        img.scaleY = this.state.canvasHeight / image.height;
        this.stageUpdate( img );9
        setTimeout(()=>{
            img.scaleX = this.state.canvasWidth / image.width;
            img.scaleY = this.state.canvasHeight / image.height;
            this.stageUpdate( img );
        }, 0);


    }

    componentDidMount(){
        TimelineBackgroundComponent.blur = true;
        this.setState({
            "state": "off",
            "apply": "activate"
        })
        this.stage = new createjs.Stage(React.findDOMNode(this.refs.gallery));
        //createjs.Ticker.setFPS(1);
        //createjs.Ticker.addEventListener("tick", this.stage);

        this.actionBlur();
        this.load(this.props.data.images);
        Application.pipe.emit(MainEvents.MAKERTITLE, this.props.data.maker);

    }

    componentWillUnmount(){
        this.setState({
            "state": "show",
            "apply": "deactivate"
        });
        Application.pipe.emit(TimelineEvents.PAUSECYCLE);
        Application.pipe.emit(MainEvents.MAKERTITLE, 0);
        //createjs.Ticker.removeEventListener("tick", this.stage);
        this.stage = null;
    }

    actionBlur(){
        setTimeout(()=>{
            this.setState({
                "state": "show"
            });
            Application.pipe.emit(TimelineEvents.GET_IMAGE);
        },10);
        setTimeout(()=>{
            Application.pipe.emit(TimelineEvents.GET_IMAGE);
        },1000);
    }
    applyFade(image /* CreateJS Bitmap */){
        image.alpha = 0;
        createjs.Tween.get(image).to({alpha:1}, 500);
        return image;
    }

    stageUpdate(image){
        if(!this.stage){
            clearTimeout(this.stageTimer);
            this.stageTimer = setTimeout(()=>{
                this.stageUpdate(image);
            },10);
        }else{
            clearTimeout(this.stageTimer);
            this.stage.addChild(image);
            setTimeout(()=>{
                this.stage.update();
            }, 100);
            return false;
        }

    }

    load(images){
        this.images = images;
        this.preload.loadAssets(images);
    }

    handleOnClick(event){
        this.nextImage();
    }

    render(){
        var dots = [];
        var style = {
            width: this.state.progress + "%"
        }

        this.state.imagesRaw.forEach((image, index)=>{
            var _clsName = (index == this.state.currentIndex ? 'active': null);
          dots.push(<a onClick={this.handleDotClick} key={index} className={_clsName} data-index={index}><span className="assistive-text">image {index}</span></a>)
        });
        if(dots.length == 1){
            dots = [];
        }
        var dotsStyles = {
            marginTop: this.state.canvasHeight+10 + "px",
            maxWidth: this.state.canvasWidth
        }

        return (

            <div className="gallery-content-component">
                <div id="progress" style={style}></div>
                <CloseButtonComponent />
                <aside className="aside">
                    <h3>
                        {this.props.data.title}
                    </h3>
                    <p>{this.props.data.furniture.standfirst}</p>
                    <a target="_blank" href={this.props.data.facebookShare} className="shareComponent facebookShare--button"><span className="assistive-text">Facebook</span></a>
                    <a target="_blank" href={this.props.data.twitterShare} className="shareComponent twitterShare--button"><span className="assistive-text">Twitter</span></a>
                </aside>
                <canvas onClick={this.handleOnClick} ref="gallery" id="photoGallery" width={this.state.canvasWidth} height={this.state.canvasHeight} className="gallery" data-state={this.state.ready}></canvas>
                <div className="dotsContainer" style={dotsStyles}>{dots}</div>
            </div>
        )
    }
}
GalleryContentComponent.contextTypes = {
    router: React.PropTypes.func
}