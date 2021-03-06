/**
 * Facade/dispatcher for piping
 */
import { Application } from '../index';


/**
 * Vendor dependencies
 */
import React from 'react/addons';
import Router from 'react-router';
import Hammer from 'hammerjs';
import easeljs from 'easeljs';
import tweenjs from 'tweenjs';

/**
 * App dependencies
 */
import { ClockViewEvents, ClockView } from './clock.jsx!';
import { MainEvents } from '../main.jsx!';
import { BaseView } from './base';
import { StaticAssetsStore, StaticAssetsStoreEvents } from '../emitters/staticAssets';
import { AmbientVideoEmitterEvent } from '../emitters/ambientVideo';
import { HeaderComponent } from './header.jsx!';
import { VideosContentComponent } from './content/video.jsx!';
import { DataEvents, Data } from '../data/data';
import { PreviewComponent } from './timelinePreview.jsx!';


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
    BLUR: "timelinebackground:blur",
    ADDPREVIEW: "timelineevents:addPreview",
    REMOVEPREVIEW: "timelineevents:removePreview",
    PAUSECYCLE: "timelineevents:pauseCycling",
    ADDPULLQUOTE: "timelineevents:AddPullquote"

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
        //Math.ceil(Math.random() * (6 - 1) + 1)
        this.state = {
            currentMaker: Application.maker,
            styles: {
                "opacity": 0
            }
        }
        /**
         * Holds a reference for all the containers added to the stage
         * @type {Array}
         */
        this.cacheStore = [];

        /**
         * Holds a reference to the current imageid
         */
        this.currentImageId;
        this.assignEvents();


    }

    assignEvents(){
        /**
         * Piping dispatcher listeners, receives various events from the asset managers
         */
        Application.pipe.on(AmbientVideoEmitterEvent.PLAYING, _.bind(this.handleVideoPlaying, this));
        Application.pipe.on(StaticAssetsStoreEvents.SEND_RESULT, _.bind(this.addBitMapToStage, this));

        Application.pipe.on(TimelineEvents.PANEND, _.bind(this.handleTimeLinePanEnd, this));
        Application.pipe.on(TimelineEvents.PAN, _.bind(this.handleTimeLinePan, this));

        Application.pipe.on(TimelineEvents.GET_IMAGE, _.bind(this.getImageFromStaticStore, this))
        Application.pipe.on(ClockViewEvents.POSITION, ()=>{
            this.handleTimeLinePanEnd();
        });

        Application.pipe.on(MainEvents.FILTERMAKERS,(makerId)=>{
            if(makerId){
                this.setState({currentMaker: makerId});
                setTimeout(()=>{
                    this.handleTimeLinePan();
                    this.handleTimeLinePanEnd();
                }, 0)
            }
        });
    }


    /**
     * Applys a blur filter if @blur is set to true
     * @param bitmap {createjs BitMap}
     * @returns {*}
     */
    applyBlurFilter(bitmap /* CreateJS Bitmap */) {
        var isIE11 = !!navigator.userAgent.match(/Trident.*rv[ :]*11\./)
        var blurFilter = isIE11 ? new createjs.BlurFilter(3,3,1) : new createjs.BlurFilter(10,10,1);
        bitmap.filters = [blurFilter];
        bitmap.cache(0,0, bitmap.image.width, bitmap.image.height, 1);
        return bitmap;
    }


    /**
     * Applies a Fade
     * @param image {createjs BitMap}
     * @returns {*|Container}
     */
     applyFade(image /* CreateJS Bitmap */){
        image.alpha = 0;
        var container = new createjs.Container();
        container.addChild(image);
        createjs.Tween.get(image).to({alpha:1}, this.cycling ? 2000 : 500);
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


        //if(TimelineBackgroundComponent.blur){
        //    img = TimelineBackgroundComponent.applyBlurFilter(img)
        //}

        if(TimelineBackgroundComponent.blur){
            img = this.applyBlurFilter(img);
            img = this.applyFade(img);
            img.scaleX = 2.666666;
            img.scaleY = 2.666666;
            setTimeout(()=>{
                this.stageUpdate( img );
            }, 1);

        }else{
            img = this.applyFade(img);
            img.scaleX = 2.666666;
            img.scaleY = 2.666666;
            this.stageUpdate( img );
        }


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
        this.setState({
            styles: {
                opacity: 1
            }
        });
        createjs.Ticker.setFPS(32);
        createjs.Ticker.addEventListener("tick", this.stage);
        return false;
    }

    /**
     * Return formatted string of image assets for preloadjs
     * @param imageid
     * @returns {string}
     */
    generateImageLink(imageid){
        return "maker0"+this.state.currentMaker+"_"+ imageid +"_jpg";
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
            this.applyFade(video);
            video.scaleX = 1.333333;
            video.scaleY = 1.333333;
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
        if(!ClockView.hour) return;
        createjs.Ticker.setFPS(60);
        this.currentImageId = ClockView.hour;
        return this.getImageFromStaticStore();
    }

    /**
     * Handles the timeline panning TODO: replace hardcoded 01 to dynamic makers
     * @param imageid {number}
     * @return boolean
     */
    handleTimeLinePanEnd(imageid) {
        if(!ClockView.hour) return;
        createjs.Ticker.setFPS(32);
        this.getImageFromStaticStore();
        Application.pipe.emit(AmbientVideoEmitterEvent.VIDEO_SRC, '0'+this.state.currentMaker, ClockView.hour);
        return false;
    }

    /**
     * Get Current Image from Static Store
     * @returns {number|*}
     */
    getImageFromStaticStore(){
        Application.pipe.emit(StaticAssetsStoreEvents.GET_RESULT, this.generateImageLink(ClockView.hour));
        return this.currentImageId;
    }

    /**
     * React JS method
     * @returns {XML}
     */
    render(){
        return (
            <div style={this.state.styles}>
                <div className="bg-filter"></div>
                <canvas ref="Stage" id="ambientvideos" width="1280" height="720" className="bg"></canvas>
            </div>

        )
    }

    /**
     * Stage update, also calls the caching function at the same time.
     * @param image
     * @returns {boolean}
     */
    stageUpdate(image){
        if(!this.stage) return;
        this.cacheStore.push(image);
        this.stage.addChild(image);
        setTimeout(()=>{
            this.stage.update();
        },0)

        this.cache();
        return false;
    }
}
TimelineBackgroundComponent.blur = false;

var pullQuotes = {
    "1" : true,
    "6": true,
    "10" : true,
    "13": true,
    "16": true,
    "21" : true
};
export class TLNode extends React.Component {
    constructor(){
        super();
        this.setCurrentMakerId = this.setCurrentMakerId.bind(this);
        this.state = {
            imageEl: null,
            bbxL: "",
            bbxT: "",

        };

        Application.pipe.on(MainEvents.FILTERMAKERS, this.setCurrentMakerId);
        this.handleOnOver = _.bind(this.handleOnOver, this);
        this.handleOnLeave = _.bind(this.handleOnLeave, this);
    }

    componentDidMount(){
        this.el = React.findDOMNode(this.refs.item);
        if(!this.props.circle){
            let bbox = this.el.getBoundingClientRect();
            this.setState({
                bbxL: bbox.left,
                bbxT: bbox.top
            });
        }
        this.makerId = Application.currentMaker;
    }

    handleOnOver(event){
        let bbox = event.target.getBoundingClientRect();
        if(this.over) return
        if(Application.currentMaker){
            if(this.props.data.maker != Application.currentMaker){
                return;
            }
        }
        Application.pipe.emit(TimelineEvents.ADDPREVIEW, bbox.left, bbox.top, this.props.data);
        Application.pipe.emit(MainEvents.MAKERTITLE, this.props.data.maker);
        this.over = true;
        if(this.props.circle){
            let style = {
                backgroundImage: 'url(' +(this.props.data.furniture ? Application.assetLocation+this.props.data.furniture.mainImage+"_small.png" : null)+");"
            }
            this.setState({
                imageEl: <div style={style} className="circle-preview-image"></div>
            });
        }

    }

    handleOnLeave(event){
        if(this.props.circle){
            this.setState({
                imageEl: null
            })
        }
        if(this.over){
            Application.pipe.emit(TimelineEvents.REMOVEPREVIEW);
            this.over = false;
        }
        Application.pipe.emit(MainEvents.MAKERTITLE, 0);

    }

    render(){
        let type = this.props.data.type;
        let maker = this.props.data.maker;
        let slug = this.props.data.slug;
        let url = "#/content/"+Application.makers[parseInt(maker)-1]+"/"+slug;
        var pullQuote = null;

        if(type === "post"){
            pullQuote = <PreviewComponent pullquote={true} clientX={this.state.bbxL} clientY={this.state.bbxT} data={this.props.data}  />;
        }

        if(pullQuotes[this.props.data.metadata.timeline.hour] != true || this.props.circle){
                pullQuote = null;
        }

        return (
            <li key={this.props.index} ref="item" data-maker={maker} data-pullquote={this.props.data.pq} onMouseLeave={this.handleOnLeave}>
                {pullQuote}
                <a href={url} onMouseOver={this.handleOnOver} onMouseLeave={this.handleOnLeave}>
                    {this.state.imageEl}
                    <span className="assistive-text">{this.props.data.title}</span></a>
            </li>
        )
    }
    setCurrentMakerId(makerId){
        this.makerId = makerId ? makerId : Application.currentMaker;
    }
}
TLNode.propTypes = {
    data: React.PropTypes.object
};





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
        this.items = [];
        for(var i = 0;i<this.props.data.length;i++){
            this.items.push(<TLNode index={i} circle={this.props.circle} data={this.props.data[i]} />)
        }

    }


    /**
     * ReactJS method
     * @returns {XML}
     */
    render(){
        if(this.props.hourLabel){
            var hourMarker = this.props.circle ? false : <span className="marker-label">{this.props.hourLabel}:00</span>;
        }

        return (
            <li key={this.props.key} className="timeline-marker timeline-marker-start" data-minute={this.props.minute} data-time="0:00">
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
        var count = this.props.circle ? 24 : 96;
        var hourref;
        for(var i=0;i<count;i++){
            if((i % 4) == 0){
                hourref = i;
                var hour = this.props.circle ? i : ((i/4) < 10 ? '0'+(i/4) : (i/4));
                var hourcopy = hour.toString();
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
            /**
             * Holds the data for the individual timeslots
             * @type {Array.<T>|*}
             */
            if(!this.props.data) return
            var data = this.props.data.filter((item)=>{
                if(!this.props.circle){
                    return (item.metadata.timeline.hour == hourcopy && item.metadata.timeline.minute == minute)
                }else{
                    return item.metadata.timeline.hour == i;
                }
            });

            itemsTemp.push(<TimeLineItem circle={this.props.circle} key={i} data={data} hourLabel={hour} hour={hour} minute={minute} />);
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
            imageid: TimelineComponent.currentImage,
            data: Data.result ? Data.result.content : this.attachDataHandler(),
            currentMaker: null,
            styles:{
                "opacity": 0
            },
            pullquotes: [],
            pulse: "pulse-left ",
            usabilityStyles: {
                display: Application.shownSplash ? "none" : "block"
            },
            className: "showing-preview",
            currentHour: ""

        };

        this.pullquotes = [];

        /**
         * Reference to Config object
         * @type {module.exports.timeline|{INTERVAL, SENSITIVITY}|n.exports.timeline|Timeline|*}
         */
        TimelineComponent.config = this.config = Data.config;


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
            this.offset = x;
            this.scroll(x);
        });
        Application.pipe.on(ClockViewEvents.HOUR, (hour)=>{
            console.info(hour);
            if(_.includes([1,6,10,13,18,21], hour)){
                this.setState({
                    currentHour: hour
                });
            }else if(_.includes([1,6,10,13,18,21], hour+1)){
                this.setState({
                    currentHour: hour+1
                });
            }else if(_.includes([1,6,10,13,18,21], hour-1)) {
                this.setState({
                    currentHour: hour-1
                });
            }else{
                this.setState({
                    currentHour: null
                });
            }

        })
        this.handleUsabilityOnClick = this.handleUsabilityOnClick.bind(this);

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
                if(this.state.preview) return;
                this.setState({
                    showPreview: false
                });


            }
        }
        return false;
    }
    attachDataHandler(){
        Application.pipe.on(DataEvents.UPDATE, _.bind(this.handleDataUpdate, this));
    }

    /**
     * React JS method
     */
    componentDidMount(){
        this.setState({
            offset: TimelineComponent.clockPosition,
            imageid: TimelineComponent.currentImage
        });
        TimelineBackgroundComponent.blur = false;
        Application.pipe.emit(TimelineEvents.PANEND);
        Application.pipe.on(MainEvents.FILTERMAKERS,(makerId)=>{ this.setState({ currentMaker: makerId }) });
        Application.pipe.on(TimelineEvents.ADDPREVIEW, _.bind(this.handleAddingPreview, this));
        Application.pipe.on(TimelineEvents.REMOVEPREVIEW, _.bind(this.handleRemovingPreview, this));
        setTimeout(()=>{
            this.setState({
                styles: {
                    opacity: 1,
                    visibility: 'shown'
                },
                currentMaker: Application.currentMaker
            })
        }, MainEvents.timeLinetimeout || 1000);
        MainEvents.timeLinetimeout = 0;
        this.applyEvents();
        setTimeout(()=>{
            this.setState({
                pulse: "pulse-left pulse-right"
            })
        }, 500);

    }

    componentWillUnmount(){
        this.setState({
            styles: {
                opacity: 0,
                visibility: 'hidden'
            }
        })
        clearTimeout(this.previewTimeout);
    }



    handleRemovingPreview(){
        this.setState({
            preview: null
        });
        this.previewTimeout = setTimeout(()=>{
            this.setState({
                showPreview: false
            });
        }, 650);
    }
    handleAddingPreview(clientX, clientY, data){
        clearTimeout(this.previewTimeout);
        this.setState({
            preview: data && !this.pressed ? <PreviewComponent clientX={clientX} clientY={clientY} data={data} /> : null,
            showPreview: data ? true : false
        });

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
                scrollx = this.offset + delta;
                this.scroll(scrollx);
            }
        }


        return false;
    }

    handleDataUpdate(resp){
        this.setState({
            data: resp.content
        })
    }

    /**
     * Returns an image ID based on the interval TODO: change interval to 24 hours
     * @param offset {number}
     * @returns {number}
     */
    static getImageId(offset){
        let id = Math.abs(Math.ceil(offset/TimelineComponent.config.timelineInterval));
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
        if (this.velocity > 1 || this.velocity < -1) {
            this.amplitude = 0.8 * this.velocity;
            this.target = Math.round(this.offset + this.amplitude);
            this.timestamp = Date.now();
            requestAnimationFrame(_.bind(this.autoScroll, this));
        }
        Application.pipe.emit(TimelineEvents.PANEND, TimelineComponent.currentImage);

        return false;
    }


    handleUsabilityOnClick(e){
        Application.setSplashSeen();
        this.setState({
            usabilityStyles: {
                display: 'none'
            }
        });

    }



    /**
     * React render function
     *
     * @returns {XML}
     */
    render(){
        var className = this.state.currentMaker ? "maker-"+this.state.currentMaker+(this.state.showPreview ? " showing-preview" : "") : this.state.showPreview ? "showing-preview":  "removing-preview";

        return (
                <div data-current-hour={this.state.currentHour}>
                    <div id="stateContainer" key='timelineParentWRapper' className={className} style={this.state.styles}>
                        <div className="usabilitySplash" onClick={this.handleUsabilityOnClick} style={this.state.usabilityStyles}>
                            <p> 24 hours in the lives <br/> of five extraordinary makers
                                <br/>
                                <small ref="small" className={this.state.pulse}>Drag left or right to explore the timeline <br/> Click top left to meet and filter makers </small>
                            </p>
                        </div>
                        <div ref="Timeline" id="timelineWrapper" className="timeline" key='timelineParent'>
                            {this.state.preview}
                            <TimelineListView offset={this.state.offset} data={this.state.data} key='timelineListView'  />
                        </div>
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

        this.setState({
          showPreview: true
        });
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
        v = 500 * delta / (1 + elapsed);
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
TimelineComponent.config = Data.config;