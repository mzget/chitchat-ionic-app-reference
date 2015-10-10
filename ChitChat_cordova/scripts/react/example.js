// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
/// <reference path="../typings/tsd.d.ts" />
var data = [
    { author: "Pete Hunt", text: "This is one comment" },
    { author: "Jordan Walke", text: "This is *another* comment" },
    { author: "Name Surname", text: "This is *another* comment" }
];
var CommentBox = React.createClass({
    loadCommentsFromServer: function () {
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
    getInitialState: function () {
        return { data: [] };
    },
    componentDidMount: function () {
        this.setState({ data: this.props.data });
        //this.loadCommentsFromServer();
        //setInterval(this.loadCommentsFromServer, this.props.pollInterval);
    },
    render: function () {
        return (React.createElement("div", {"className": "commentBox"}, React.createElement("h1", null, "Comments"), React.createElement(CommentList, {"data": this.state.data}), React.createElement(CommentForm, null)));
    }
});
var CommentList = React.createClass({
    render: function () {
        var commentNodes = this.props.data.map(function (comment) {
            return (React.createElement(Comment1, {"author": comment.author}, comment.text));
        });
        return (React.createElement("div", {"className": "commentList"}, commentNodes));
    }
});
var CommentForm = React.createClass({
    handleSubmit: function (e) {
        e.preventDefault();
        var author = React.findDOMNode(this.refs.author).value.trim();
        var text = React.findDOMNode(this.refs.text).value.trim();
        if (!text || !author) {
            return;
        }
        // TODO: send request to the server
        React.findDOMNode(this.refs.author).value = '';
        React.findDOMNode(this.refs.text).value = '';
        return;
    },
    render: function () {
        return (React.createElement("form", {"className": "commentForm", "onSubmit": this.handleSubmit}, React.createElement("input", {"type": "text", "placeholder": "Your name", "ref": "author"}), React.createElement("input", {"type": "text", "placeholder": "Say something...", "ref": "text"}), React.createElement("input", {"type": "submit", "value": "Post"})));
    }
});
var Comment1 = React.createClass({
    rawMarkup: function () {
        var rawMarkup = marked(this.props.children.toString(), { sanitize: true });
        return { __html: rawMarkup };
    },
    render: function () {
        return (React.createElement("div", {"className": "comment"}, React.createElement("h2", {"className": "commentAuthor"}, this.props.author), React.createElement("span", {"dangerouslySetInnerHTML": this.rawMarkup()})));
    }
});
React.render(React.createElement(CommentBox, {"data": data}), document.getElementById('content'));
