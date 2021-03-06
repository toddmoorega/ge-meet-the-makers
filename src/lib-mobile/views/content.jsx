/**
 * Individual Maker View
 */
import { MobileApplication } from '../index';

import React from 'react';
import marked from 'marked';

import { MainEvents, MainDefaults } from '../main.jsx!';
import { SocialNavComponent } from './elements/social.jsx!';
import { PostContentComponent } from './content/post.jsx!';
import { GalleryContentComponent } from './content/gallery.jsx!';
import { VideoContentComponent } from './content/video.jsx!';
import { InfographicContentComponent } from './content/infographic.jsx!';

/**
 * Component for Maker profile header
 */
export class ContentHeaderComponent extends React.Component {

    constructor(){
        super();
    }

    render(){
		var { maker, content } = this.props;
		//<img src={maker.portraitImg} alt={maker.name+" - "+maker.role} />
		// Ensure time fits 00:00 format
    	var hour = content.metadata.timeline.hour.toString().length > 1 ? content.metadata.timeline.hour : "0"+content.metadata.timeline.hour;
    	var minute = content.metadata.timeline.minute.toString().length > 1 ? content.metadata.timeline.minute : "0"+content.metadata.timeline.minute;

        return (
			<header className="maker-details">
				<i className={"industry-icon icon-"+maker.icon}></i>
				<div className="time">
					{hour}:{minute}
				</div>
				<a href={"#/maker/"+maker.slug}>
					<div className="profile">
						<h3>{maker.role}</h3>
						<h2>{maker.name}</h2>
					</div>
				</a>
			</header>
        )
    }
}

/**
 * Component for Maker article
 */
export class ContentArticleComponent extends React.Component {

    constructor(){
        super();
    }

    render(){
    	var { content } = this.props;

    	switch ( content.type ){
			case "post":
				return (
					<PostContentComponent content={content} />
		        );
		        break;
			case "gallery":
				return (
					<GalleryContentComponent content={content} />
		        );
		        break;
		    case "video":
				return (
					<VideoContentComponent content={content} />
		        );
		        break;
		    case "factoid":
				return (
					<InfographicContentComponent content={content} />
		        );
		        break;
		    default:
				console.log("Error: Unknown content.");
				return false;
		        break;
	    }
    }
}

/**
 * Component for Maker footer, including Maker pagination
 */
export class ContentFooterComponent extends React.Component {

    constructor(){
        super();
    }

    render(){
    	var { makerId, makerData, data, contentIndex, content } = this.props;

    	// Pagination count and Prev/Next links
    	var contentCount = data.length;
    	var next = contentIndex < contentCount-1 ? contentIndex+1 : 0;
    	var prev = contentIndex > 0 ? contentIndex-1 : contentCount-1;
    	var nextContent = data[next];
    	var prevContent = data[prev];
		var nextMakerSlug = makerData[nextContent.maker].slug;
    	var prevMakerSlug = makerData[prevContent.maker].slug;

    	var makersName = "";
    	if ( makerId ){
    		makersName = makerData[makerId].name+"'s ";
    	}


		var fbShare = "http://www.facebook.com/sharer/sharer.php?u=http://labs.theguardian.com/innovation-never-sleeps/"+window.location.hash.replace("#", "%23");
		var _url = "http://labs.theguardian.com/innovation-never-sleeps/"+window.location.hash.replace("#", "%23");
		var fbShare = "http://www.facebook.com/sharer/sharer.php?u="+_url;
		var twitterShare = `http://twitter.com/share?text=${content.twitterMessage ? content.twitterMessage : "Over 24 hours they change our seas, skies and solar system. Meet the makers"}&url=${_url}&hashtags=InnovationNeverSleeps, interactive`;
		var linkedin = `https://www.linkedin.com/shareArticle?mini=true&url=${_url}&title=${encodeURI(content.title)}`;

        return (
			<footer>
				<SocialNavComponent twitter={twitterShare} facebook={fbShare} linkedin={linkedin} twitterMsg={content.twitterMessage} />
				<div className="page-nav border-bottom">
					<a className="page-nav-previous" href={"#/content/"+prevMakerSlug+"/"+prevContent.slug}>Previous</a>
					<div className="page-nav-counter">{contentIndex+1} of {contentCount}</div>
					<a className="page-nav-next" href={"#/content/"+nextMakerSlug+"/"+nextContent.slug}>Next</a>
				</div>
				<a className="link-wide border-bottom" href="#/timeline"><i className="arrow-back"></i>Back to {makersName}timeline</a>
			</footer>
        )
    }
}

/**
 * Component for Individual Maker View
 */
export class ContentComponent extends React.Component {
    
    constructor(){
        super();
        this.state = {
        	height: MainEvents.VIEWPORT.height
        }
    }

	componentDidMount() {
		MobileApplication.pipe.emit(MainEvents.HIDEFILTER, true);
	}
    
    render(){
    	var { makerId, data, makerData, params } = this.props;
    	var filteredData = data;
    	var bgImg, maker, makerKey;
    	var makerSlug = params.maker;

		if ( !makerId ){
			// Find requested Maker
			makerKey = _.findKey(makerData, function(m) {
	    		return m.slug == params.maker;
			});

			// 404 Handling
			if ( _.isUndefined(makerData[makerKey]) ){
				return (
		            <main className="mobile-about" style={{minHeight: this.state.height}}>
		            	<div className="texture-overlay"></div>
		            	<div className="content-container">
							<article className="type-post">
								<h1 className="title bordered">Oops!</h1>
								<p>Sorry, that page doesn&rsquo;t exist.</p>
								<p><a href="#/timeline"><u>Back to Timeline.</u></a></p>
							</article>
						</div>
					</main>
		        )
			}

			var bgImg = makerData[makerKey].bgImg;
			var maker = makerData[makerKey];
		} else {
			makerKey = makerId;

			// 404 Handling
			if ( _.isUndefined(makerData[makerId]) || makerData[makerId].slug !== makerSlug ){
				return (
		            <main className="mobile-about" style={{minHeight: this.state.height}}>
		            	<div className="texture-overlay"></div>
		            	<div className="content-container">
							<article className="type-post">
								<h1 className="title bordered">Oops!</h1>
								<p>Sorry, that page doesn&rsquo;t exist.</p>
								<p><a href="#/timeline"><u>Back to Timeline.</u></a></p>
							</article>
						</div>
					</main>
		        )
			}

			var bgImg = makerData[makerId].bgImg;
			var maker = makerData[makerId];

			filteredData = _.filter(data, { 'maker': makerId });
		}

		// Find requested Content
		var pathSlug = params.slug;
		var contentIndex = _.findIndex(filteredData, function(c) {
    		return c.slug == pathSlug && c.maker == makerKey;
		});

		// 404 Handling
		if ( _.isUndefined(contentIndex) || contentIndex === -1 ){
			return (
	            <main className="mobile-about" style={{minHeight: this.state.height}}>
	            	<div className="texture-overlay"></div>
	            	<div className="content-container">
						<article className="type-post">
							<h1 className="title bordered">Oops!</h1>
							<p>Sorry, that page doesn&rsquo;t exist.</p>
							<p><a href="#/timeline"><u>Back to Timeline.</u></a></p>
						</article>
					</div>
				</main>
	        )
		}

		var content = filteredData[contentIndex];

		return (
            <main className="mobile-maker-content" style={{backgroundImage: "url("+bgImg+")", minHeight: this.state.height}}>
            	<div className="texture-overlay"></div>
            	<div className="content-container">
					<ContentHeaderComponent makerId={makerId} maker={maker} content={content} />
					<ContentArticleComponent content={content} />
					<ContentFooterComponent makerId={makerId} makerData={makerData} data={filteredData} contentIndex={contentIndex} content={content} />
				</div>
			</main>
        )
    }
}