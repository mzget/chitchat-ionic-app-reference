// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX


/// <reference path="../typings/tsd.d.ts" />

var ReactDom = require('react-dom');
//var FlatButton = require('material-ui/lib/flat-button');

    var data = [
    { author: "Pete Hunt", text: "This is one comment" },
    { author: "Jordan Walke", text: "This is *another* comment" },
    { author: "Name Surname", text: "This is *another* comment" }
];

interface ICommentBox {
    //url: string;
    //pollInterval: number;
    data: Array<any>;
}
var CommentBox = React.createClass<any, any>({
    loadCommentsFromServer () {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function (data) {
                this.setState({ data: data });
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    handleCommentSubmit (comment) {
        // TODO: submit to the server and refresh the list
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            data: comment,
            success: function (data) {
                this.setState({ data: data });
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    getInitialState () {
        return { data: [] };
    },
    componentDidMount () {
        this.setState({ data: this.props.data });
        //this.loadCommentsFromServer();
        //setInterval(this.loadCommentsFromServer, this.props.pollInterval);
    },
    render () {
        return (
            <div className="commentBox">
        <h1>Comments</h1>
        <CommentList data={this.state.data} />
        <CommentForm onCommentSubmit={this.handleCommentSubmit} />
        </div>
        );
    }
});

interface ICommentList {
    data: Array<any>;
}
var CommentList = React.createClass<ICommentList, any>({
    render: function () {
        var commentNodes = this.props.data.map(function (comment) {
            return (
                <Comment1 author={comment.author}>
                {comment.text}
                    </Comment1>
            );
        });
        return (
            <div className="commentList">
            {commentNodes}
                </div>
        );
        }
        });

interface ICommentForm {
    onCommentSubmit();
}
var CommentForm = React.createClass<ICommentForm, any>({
    handleSubmit: function (e) {
        e.preventDefault();
        var author = this.refs.author.value.trim();
        var text = this.refs.text.value.trim();
        if (!text || !author) {
            return;
        }
        // TODO: send request to the server
        this.props.onCommentSubmit({ author: author, text: text });
        this.refs.author.value = '';
        this.refs.text.value = '';
        return;
    },
    render: function () {
        return (
            < form className= "commentForm" onSubmit= { this.handleSubmit } >
            <input type="text" placeholder="Your name" ref="author" />
            < input type= "text" placeholder= "Say something..." ref= "text" />
            <input type="submit" value="Post" />
                </form >
        );
    }
});

interface Comment1Prop {
    author: string;
    //   children: string;
}
var Comment1 = React.createClass<Comment1Prop, any>({
    rawMarkup: function () {
        var rawMarkup = marked(this.props.children.toString(), { sanitize: true });
        return { __html: rawMarkup };
    },

    render: function () {
        return (
            <div className="comment">
<h2 className="commentAuthor">
  {this.props.author}
    </h2>
<span dangerouslySetInnerHTML={this.rawMarkup() } />
                </div>
        );
    }
});

// var DefaultButton = React.createClass ({
//     render() {
//         return (
//             <FlatButton label="Default" />
//             );
//     }
// });
 
  ReactDom.render(
                <CommentBox data={data} />,
                document.getElementById('content')
            );