import { Application } from '../../index';
import { GalleryContentComponent } from './gallery.jsx!';
import { VideosContentComponent } from './video.jsx!';
import { PostsContentComponent } from './post.jsx!';
import { DataEvents, Data } from '../../data/data';
import { TimelineBackgroundComponent, TimelineEvents } from '../timeline.jsx!';
import { MainEvents } from '../../main.jsx!';
import React from 'react';
import key from 'keymaster';

export class ContentHandler extends React.Component {
    constructor(){
        super();
        this._data = Data.result || this.attachDataEventHandler();
        this.state = {
            el: null
        }
        this.nextPost = this.nextPost.bind(this);
        this.prevPost = this.prevPost.bind(this);
    }
    get data(){
        return this._data;
    }
    set data(obj){
        this._data = obj;
        if(!this._data) this.attachDataEventHandler();
    }

    attachDataEventHandler(){
        Application.pipe.on(DataEvents.UPDATE, _.bind(this.handleData, this));
    }

    componentWillMount(){
        TimelineBackgroundComponent.blur = true;

        this.setState({
            "state": "off",
            "apply": "activate"
        });
        setTimeout(()=>{
            this.setState({
                "state": "show"
            });
            Application.pipe.emit(TimelineEvents.GET_IMAGE);
        },10);
        setTimeout(()=>{
                Application.pipe.emit(TimelineEvents.GET_IMAGE);
        }, 1000);

        key('y', ()=>{
            this.nextPost();
        });
        key('t', ()=>{
            this.prevPost();
        });
    }

    componentWillUnmount(){
        this.setState({
            "state": "show",
            "apply": "deactivate"
        });
        this.nextPost = ()=>{

        }
        this.prevPost = ()=>{

        }

    }

    componentDidMount(){
        if(this._data){
            if(this._data.content){
                this.processData();
            }

        }

    }

    processData(){
        var el;
        if(this.props.params.id){
            var makerId = Application.makers.indexOf(this.props.params.maker)+1;
            this.contentData = this._data.content.filter((item)=>{
                return parseInt(item.maker) == makerId;
            }).filter((item, index)=>{
                return item.slug == this.props.params.id;
            })[0];
            this.maker = false;
            this.data.content.forEach((item, index)=>{
                if(item.slug == this.contentData.slug){
                    this.currentIndex = index;
                }
            });
        }else{
            var makerId = Application.makers.indexOf(this.props.params.makerName)+1;
            this.contentData = this._data.makers[makerId];
            this.maker = true;
            this.currentIndex = makerId;
        }



        switch(this.contentData.type){
            case "video":
                el = <VideosContentComponent data={this.contentData} key={this.context.router.name} />;
                break;
            case "gallery":
                el = <GalleryContentComponent data={this.contentData} key={this.context.router.name} />;
                break;
            case "post":
                el = <PostsContentComponent data={this.contentData} key={this.context.router.name} />;
                break;
            case "maker-bio":
                el = <PostsContentComponent data={this.contentData} key={this.context.router.name} />;
                Application.pipe.emit(MainEvents.HIDEMAKERS);
                break;
        }
        this.setState({
            el: el
        });
    }

    handleData(data){
        this.data = data;
        if(this._data.content){
            this.processData()
        }
    }

    nextPost(){
        let increment = this.currentIndex < (this.maker? 5 : this.data.content.length-1) ? this.currentIndex+1 : ( this.maker ? 1 : 0 );
        console.log(increment);
        let content = this.maker? this.data.makers[increment.toString()] : this.data.content[increment];
        let makerSlug = this.data.makers[content.maker].slug;
        window.location.hash = "#/"+(this.maker? "maker" : "content")+"/"+makerSlug+(this.maker ? "" : "/"+content.slug);
        Application.pipe.emit(MainEvents.MAKERTITLE, content.maker);
    }

    prevPost(){
        let increment = this.currentIndex > (this.maker ? 1 : 0) ? this.currentIndex-1 : ( this.maker ? 5 : this.data.content.length-1 );
        console.log(increment);
        let content = this.maker? this.data.makers[increment.toString()] : this.data.content[increment];
        let makerSlug = this.data.makers[content.maker].slug;
        window.location.hash = "#/"+(this.maker? "maker" : "content")+"/"+makerSlug+(this.maker ? "" : "/"+content.slug);
        Application.pipe.emit(MainEvents.MAKERTITLE, content.maker);
    }

    render(){
        return (
            <div key={this.context.router.name} data-content={this.state.apply} data-transition={this.state.state}>
                <a className="nextArticleArrow" onClick={this.nextPost}>Next</a>
                <a className="prevArticleArrow" onClick={this.prevPost}>Prev</a>
                {this.state.el}
            </div>
        )
    }
}
ContentHandler.contextTypes = {
    router: React.PropTypes.func
}