/**
 * Facade/dispatcher for piping
 */
import { Application } from '../index';

/**
 * Config object
 */
import config from '../config';

/**
 * Vendor dependencies
 */
import React from 'react/addons';
import Hammer from 'hammerjs';
import easeljs from 'easeljs';
import tweenjs from 'tweenjs';

/**
 * App dependencies
 */
import { ClockViewEvents } from './clock.jsx!';
import { BaseView } from './base';
import { StaticAssetsStore, StaticAssetsStoreEvents } from '../emitters/staticAssets';
import { AmbientVideoEmitterEvent } from '../emitters/ambientVideo';


/**
 * Utils
 */
import { Transition } from '../utils/reactTransition.jsx!';

/**
 * Event Constants
 * @type {{PAN: string, PANEND: string}}
 */
export const TimelineEvents = {
    /**
     * Event for panning
     */
    PAN: "timeline:pan",
    /**
     * Event for when panning ends
     */
    PANEND: "timeline:panend",
    GET_IMAGE: "timlinebackground:getimage",
    BLUR: "timelinebackground:blur"
}

/**
 * Holds constant properties
 * @type {{INTERVAL: number, WIDTH: number}}
 */
export const TimelineProps = {
    /**
     * The width of the TimelineListItem container (15 min increments)
     */
    INTERVAL: 50,
    /**
     * The total width of timeline
     */
    WIDTH:4836
}

/**
 * Manages the background videos and stills as you scroll
 * Depends on AmbientVideoEmitterEvent, StaticAssetsStoreEvents
 *
 *
 * @component
 */
export class TimelineBackgroundComponent extends React.Component {
    constructor(){
        super();

        /**
         * Holds a reference for all the containers added to the stage
         * @type {Array}
         */
        this.cacheStore = [];

        /**
         * Holds a reference to the current imageid
         */
        this.currentImageId;


        /**
         * Piping dispatcher listeners, receives various events from the asset managers
         */
        Application.pipe.on(AmbientVideoEmitterEvent.PLAYING, _.bind(this.handleVideoPlaying, this));
        Application.pipe.on(StaticAssetsStoreEvents.SEND_RESULT, _.bind(this.addBitMapToStage, this))
        Application.pipe.on(TimelineEvents.PANEND, _.bind(this.handleTimeLinePanEnd, this));
        Application.pipe.on(TimelineEvents.PAN, _.bind(this.handleTimeLinePan, this));

        Application.pipe.on(TimelineEvents.GET_IMAGE, _.bind(this.getImageFromStaticStore, this))
        Application.pipe.on(TimelineEvents.BLUR, _.bind(this.handleBlur, this));

        Application.pipe.on(ClockViewEvents.POSITION, (scrollx)=>{
             this.handleTimeLinePanEnd(TimelineComponent.getImageId(scrollx));
        });


    }

    get blur(){
        return this._blur;
    }

    set blur(bool){
        this._blur = bool;
    }

    /**
     * Applys a blur filter if @blur is set to true
     * @param bitmap {createjs BitMap}
     * @returns {*}
     */
    static applyBlurFilter(bitmap /* CreateJS Bitmap */) {
        var blurFilter = new createjs.BlurFilter(50,50,1);
        bitmap.filters = [blurFilter];
        bitmap.cache(0,0, bitmap.image.width, bitmap.image.height, 1);
        return bitmap;
    }


    /**
     * Applies a Fade
     * @param image {createjs BitMap}
     * @returns {*|Container}
     */
    static applyFade(image /* CreateJS Bitmap */){
        image.alpha = 0;
        var container = new createjs.Container();
        container.addChild(image);
        createjs.Tween.get(image).to({alpha:1}, 500);
        return container;
    }

    /**
     * Handles control for images being added to stage and applies filters
     * @param image
     * @returns {boolean}
     */
    addBitMapToStage(image){
        if(!image)return
        var img = new createjs.Bitmap(image);

        if(this.blur){
            img = TimelineBackgroundComponent.applyBlurFilter(img)
        }
        img = TimelineBackgroundComponent.applyFade(img);

        this.stageUpdate( img );
        return false;
    }

    /**
     * used to remove old elements from the stage
     * @returns {boolean}
     */
    cache(){
        if(this.cacheStore.length > 10){
            var ref = this.cacheStore[0]
            this.stage.removeChild(ref);
            this.cacheStore.splice(0,1);
        }
        return false;
    }

    /**
     * ReactJS method
     * @returns {boolean}
     */
    componentDidMount(){
        this.stage = new createjs.Stage(React.findDOMNode(this.refs.Stage));
        createjs.Ticker.setFPS(32);
        createjs.Ticker.addEventListener("tick", this.stage);
        return false;
    }

    /**
     * Returns 01 for 1 and 10 for 10
     * @param imageid {number}
     * @returns {string}
     */
    getformattedId(imageid /* Number */){
        return (imageid < 10 ? '0'+imageid : imageid)
    }

    /**
     * Return formatted string of image assets for preloadjs
     * @param imageid
     * @returns {string}
     */
    generateImageLink(imageid){
        return "maker01_"+ this.getformattedId(imageid) +"_jpg";
    }

    /**
     * Sets the blur from an event
     * @param bool
     */
    handleBlur(bool){
       return this.blur = bool;
    }

    /**
     * Handler for ambient video event scales videos
     * TODO: Moving scaling into config
     * @param video
     * @returns {boolean}
     */
    handleVideoPlaying(video /* videoDOM element */){
        if(video){
            var video = new createjs.Bitmap(video);
            video.scaleX = 1.05;
            video.scaleY = 1.05;
            video = TimelineBackgroundComponent.applyFade(video);
            this.stageUpdate( video );
        }

        return false;
    }


    /**
     * Handle changing the static image when panning
     * @param offset {number}
     * @param imageid {number}
     * @returns {boolean}
     */
    handleTimeLinePan(offset, imageid){
        if(!imageid) return;
        this.currentImageId = imageid;
        return this.getImageFromStaticStore();
    }

    /**
     * Handles the timeline panning TODO: replace hardcoded 01 to dynamic makers
     * @param imageid {number}
     * @return boolean
     */
    handleTimeLinePanEnd(imageid) {
        if(!imageid) return;
        this.currentImageId = imageid;
        this.getImageFromStaticStore();
        Application.pipe.emit(AmbientVideoEmitterEvent.VIDEO_SRC, '01', imageid);
        return false;
    }

    /**
     * Get Current Image from Static Store
     * @returns {number|*}
     */
    getImageFromStaticStore(){
        Application.pipe.emit(StaticAssetsStoreEvents.GET_RESULT, this.generateImageLink(this.currentImageId));
        return this.currentImageId;
    }

    /**
     * React JS method
     * @returns {XML}
     */
    render(){
        return (
            <div>
                <div className="bg-filter"></div>
                <canvas ref="Stage" id="ambientvideos" width="640" height="360" className="bg"></canvas>
            </div>

        )
    }

    /**
     * Stage update, also calls the caching function at the same time.
     * @param image
     * @returns {boolean}
     */
    stageUpdate(image){
        this.cacheStore.push(image);
        this.stage.addChild(image);
        this.stage.update();
        this.cache();
        return false;
    }
}

/**
 * Component for the TimeLineItems
 *
 * @children TimelineNode
 * @class
 */
export class TimeLineItem extends React.Component {
    constructor(){
        super();
    }

    /**
     * ReactJS method
     */
    componentDidMount(){
        /**
         * Genereate random temporary dots TODO: implement proplery
         * @type {number}
         * @private
         */
        this._rnd = Math.floor(Math.random() * (8 - 0) + 0);
        this.items = [];
        for(var i = 0;i<this._rnd;i++){
            this.items.push(<li key={i}><a><span className="assistive-text">Content title</span></a></li>)
        }
    }

    /**
     * ReactJS method
     * @returns {XML}
     */
    render(){
        if(this.props.hourLabel){
            var hourMarker = <span className="marker-label">{this.props.hourLabel}:00</span>;
        }

        return (
            <li key={this.props.key} className="timeline-marker timeline-marker-start" data-time="0:00">
                <div className="marker-data">
                    <ul>
                        {this.items}
                    </ul>
                </div>
                <span className="marker-line marker-line-start"></span>
                <span className="marker-tick marker-tick-long"></span>
                {hourMarker}
            </li>
        )
    }
}

/**
 * Handles the DOM transform to move the timeline on an x axis
 * Changes to props.offset create transition
 *
 * @class
 * @component
 *
 */
export class TimelineListView extends React.Component {
    constructor(){
        super();
        this.x = 0;

        this.props = {
            _id: "timeline"
        };

        /**
         * TODO: have resued this a couple of times, should put it into a utls function
         */

        ['Webkit', 'Moz', 'O', 'ms'].every(_.bind(function (prefix) {
            let e = prefix + 'Transform';
            if(typeof document.createElement("div").style[e] !== 'undefined'){
                this.xform = e;
                return false;
            }
            return true;
        },this));

    }
    componentDidMount(){
        this.setState({ _id: "timeline1"});
    }

    /**
     * Generates TimeLineItem components and adds hour and minute props
     * to generate approiate labels
     * @returns {Array}
     */
    generateHoursMinutesLabels(){
        var itemsTemp = [];
        var hourref;
        for(var i=0;i<96;i++){
            if((i % 4) == 0){
                hourref = i;
                var hour = ((i/4) < 10 ? '0'+(i/4) : (i/4));
                var minute = '00';

            }else{
                var hour = null;
                var minute;
                switch(i-hourref){
                    case 1:
                        minute = '15';
                        break;
                    case 2:
                        minute = '30';
                        break;
                    case 3:
                        minute = '45';
                        break;
                    default:
                        minute = '00';
                        break;
                }
            }
            itemsTemp.push(<TimeLineItem key={i} hourLabel={hour} hour={hour} minute={minute} />);
        }
        return itemsTemp;
    }
    render(){
        /**
         * Object literal to hold the transform styles
         * @type {{}}
         */
        var styles = {};

        /**
         * Holds items to render
         */
        var items = this.generateHoursMinutesLabels();



        styles[this.xform] = 'translateX(' + (-this.props.offset) + 'px)';
        return (
                    <ol key='timelineListView' id="timelineList" className="timeline-list" style={styles}>
                        {items}
                    </ol>

        )
    }
}

/**
 * Class for handling the scrolling event
 * Handles just the exponential decay and scrolling events.
 * Does not update DOM props but rather triggers an event:
 *
 * @class
 * @component
 * @event {TimelineEvents.PAN} triggered when panning
 * @event {TimelineEvents.PANEND} trigger upon completion of the panning
 * @selector {id: TimelineComponent}
 *
 */
export class TimelineComponent extends React.Component {
    /**
     *  Main entry for TimelineComponent
     *  this a few default variables and listens for piping events from App {Facade}.
     *
     *  @constructor
     *  @return {undefined}
     */
    constructor(){
        super();

        /**
         * ReactJS state object
         * @type {{offset: number}}
         */
        this.state = {
            offset: TimelineComponent.clockPosition,
            imageid: TimelineComponent.currentImage

        };

        /**
         * Reference to Config object
         * @type {module.exports.timeline|{INTERVAL, SENSITIVITY}|n.exports.timeline|Timeline|*}
         */
        TimelineComponent.config = this.config = config.timeline;

        /**
         * Max scrolling limit
         * @type {number}
         */
        this.max = TimelineProps.WIDTH;

        /**
         * Holds scrolling offset
         * @type {number}
         */
        this.offset = TimelineComponent.clockPosition;
        this.min = 0;

        this.pressed = false;
        /**
         * Used to set style.transform props with browser prefix
         * @type {string}
         */
        this.xform = 'transform';

        /**
         * Used in the exponential decay function
         * @type {number}
         */
        this.timeConstant = 325;
        /**
         * Can be used to snap to positions on the timeline
         * Math.round(this.target / this.snap) * this.snap;
         *
         * currently not implemented
         *
         * @type {number}
         */
        this.snap = TimelineProps.INTERVAL;
        Application.pipe.on(ClockViewEvents.POSITION, (x)=>{
            TimelineComponent.clockPosition = x;
            this.offset = x;

        });


    }

    /**
     * Applys the HammerJS event handlers
     * @returns {boolean}
     */
    applyEvents(){
        this.timelineHammer = new Hammer(React.findDOMNode(this.refs.Timeline));
        this.timelineHammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
        this.timelineHammer.on('panstart', _.bind(this.tap, this));
        this.timelineHammer.on('pan', _.bind(this.handleDrag, this));
        this.timelineHammer.on('panend', _.bind(this.release, this));
        return false;
    }

    /**
     * Based off [http://ariya.ofilabs.com/2013/11/javascript-kinetic-scrolling-part-2.html]
     * Rough implementation of exponential decay
     *
     */
    autoScroll(){
        var elapsed, delta, scrollx;
        if (this.amplitude) {
            elapsed = Date.now() - this.timestamp;
            delta = -this.amplitude * Math.exp(-elapsed / this.timeConstant);
            if (delta > 0.5 || delta < -0.5) {
                scrollx = this.target + delta
                this.scroll(scrollx);
                requestAnimationFrame(_.bind(this.autoScroll, this));
            } else {
                scrollx = this.target // Math.round(this.target / this.snap) * this.snap;
                this.scroll(scrollx);
                Application.pipe.emit(TimelineEvents.PANEND, TimelineComponent.getImageId(scrollx));
            }
        }
        return false;
    }

    /**
     * React JS method
     */
    componentDidMount(){
        this.setState({
            offset: TimelineComponent.clockPosition,
            imageid: TimelineComponent.currentImage
        });
        Application.pipe.emit(TimelineEvents.BLUR, false);
        Application.pipe.emit(TimelineEvents.PANEND, TimelineComponent.getImageId(this.state.offset));
        this.applyEvents();
    }

    /**
     * Drag event
     * @param e {HammerJS event}
     * @returns {boolean}
     */
     handleDrag(e){
        var x, delta, scrollx;
        if (this.pressed) {
            x = this.xpos(e);
            delta = this.reference - x;
            if (delta > 2 || delta < -2) {
                this.reference = x;
                scrollx = this.offset + delta
                this.scroll(scrollx);
            }
        }
        return false;
    }

    /**
     * Returns an image ID based on the interval TODO: change interval to 24 hours
     * @param offset {number}
     * @returns {number}
     */
    static getImageId(offset){
        let id = Math.abs(Math.ceil(offset/TimelineComponent.config.INTERVAL));
        if(id == 0){
            id = 1
        }
        return  id;
    }

    /**
     * When the timeline wrapper has a release event from the user
     * @param e {HammerJS event}
     * @returns {boolean}
     */
    release(e){
        this.pressed = false;

        clearInterval(this.ticker);
        if (this.velocity > 5 || this.velocity < -5) {
            this.amplitude = 0.8 * this.velocity;
            this.target = Math.round(this.offset + this.amplitude);
            this.timestamp = Date.now();
            requestAnimationFrame(_.bind(this.autoScroll, this));
        }
        Application.pipe.emit(TimelineEvents.PANEND, TimelineComponent.currentImage);
        return false;

    }



    /**
     * React render function
     *
     * @returns {XML}
     */
    render(){
        return (
                <div key='timelineParentWRapper'>
                    <div ref="Timeline" id="timelineWrapper" className="timeline" key='timelineParent'>
                        <TimelineListView offset={this.state.offset} key='timelineListView'  />
                    </div>
                </div>
        )
    }

    /**
     * Updates the state of the component according to an x value
     *
     * @param x {number}
     */
    scroll(x){
        TimelineComponent.clockPosition = this.offset = (x > this.max) ? this.max : (x < this.min) ? this.min : x;
        TimelineComponent.currentImage = TimelineComponent.getImageId(this.offset);
        this.setState({
            offset: TimelineComponent.clockPosition,
            imageid: TimelineComponent.currentImage
        });
        Application.pipe.emit(TimelineEvents.PAN, this.offset, this.state.imageid);
        return false;
    }

    /**
     * Handles the start of the scroll timeline action
     * @param e {event}
     * @returns {boolean}
     */
    tap(e){
        this.pressed = true;
        this.reference = this.xpos(e);
        this.velocity = this.amplitude = 0;
        this.frame = this.offset;
        this.timestamp = Date.now();
        clearInterval(this.ticker);
        this.ticker = setInterval(_.bind(this.track, this), 100);


        return false;
    }

    /**
     * Used to set the velocity for the exponential decay function
     *
     * @returns {boolean}
     */
    track(){
        var now, elapsed, delta, v;

        now = Date.now();
        elapsed = now - this.timestamp;
        this.timestamp = now;
        delta = this.offset - this.frame;
        this.frame = this.offset;
        v = 100 * delta / (1 + elapsed);
        this.velocity = 0.8 * v + 0.2 * this.velocity;
        return false;
    }

    /**
     * Drag event
     * @param e {HammerJS event}
     * @returns {boolean}
     */
    drag(e){
        var x, delta, scrollx;
        if (this.pressed) {
            x = this.xpos(e);
            delta = this.reference - x;
            if (delta > 2 || delta < -2) {
                this.reference = x;
                scrollx = this.offset + delta
                this.scroll(scrollx);
            }
        }
        return false;
    }


    /**
     * Returns the x position and handles both desktop and mobile drags
     * @param e {HammerJS event}
     * @returns {*}
     */
    xpos(e){
        if (e.srcEvent.targetTouches && (e.srcEvent.targetTouches.length >= 1)) {
            return e.srcEvent.targetTouches[0].clientX;
        }
        return e.srcEvent.clientX;
    }

}
TimelineComponent.clockPosition = null;
TimelineComponent.currentImage = null;