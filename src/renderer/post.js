import {ipcRenderer, remote} from 'electron';
import {Grid, Row, Col} from 'react-bootstrap';
import fs from 'fs';
import chokidar from 'chokidar';
import React from 'react';
import ReactDOM from 'react-dom';

class Post extends React.Component {
  constructor(props) {
    super(props);

    const win = remote.getCurrentWindow();
    this.path = win.instance.path;
    this.height = 0;
    this.state = {
      content: '',
      autoResize: win.instance.autoResize,
    };
  }

  createStateByDiff(diff) {
    return Object.assign({}, this.state, diff);
  }

  componentDidMount() {
    ::this.handleFileUpdate();
    chokidar.watch(this.path).on('change', ::this.handleFileUpdate);
    chokidar.watch(this.path).on('unlink', () => {
      remote.getCurrentWindow().close();
    });

    window.addEventListener('resize', ::this.handleResize);
    this.height = window.innerHeight;
    remote.getCurrentWindow().show();
  }

  handleFileUpdate() {
    const content = fs.readFileSync(this.path, 'utf8');
    if (content) {
      this.setState(this.createStateByDiff({ content }));
    }
  }

  handleResize(event) {
    // scrollHeight: 入力内容全体
    // offsetHeight: 要素の大きさ
    const textarea = document.getElementById('editor');
    const areaCotentDiff = textarea.scrollHeight - textarea.offsetHeight;
    const resizeDiff = window.innerHeight - this.height;
    var newState = this.state;
    if (resizeDiff < 0) {
      if (areaCotentDiff > 0) {
        newState = this.createStateByDiff({ autoResize: false });
      }
    } else if (resizeDiff > 0) {
      if (areaCotentDiff <= 0) {
        newState = this.createStateByDiff({ autoResize: true });
      }
    }
    this.setState(newState);

    this.height = window.innerHeight;
  }

  handleBlur(event) {
    fs.writeFileSync(this.path, event.target.value);
  }

  handleChange(event) {
    const textarea = event.target;

    if (this.state.autoResize) {
      const areaCotentDiff = textarea.scrollHeight - textarea.offsetHeight;
      if (areaCotentDiff > 0) {
        resizeTo(window.innerWidth, window.innerHeight + areaCotentDiff);
      }
    }

    this.setState(this.createStateByDiff({ content: textarea.value }));
  }

  handlePlus(event) {
    ipcRenderer.send('add-post', this.path);
  }

  handleRemove(event) {
    ipcRenderer.send('remove-post', this.path);
    remote.getCurrentWindow().close();
  }

  render() {
    const overflow = this.state.autoResize ? 'hidden' : 'auto';
    const textareaStyle = { overflow };

    remote.getCurrentWindow().instance.autoResize = this.state.autoResize;

    return (
      <div className="post fix-height">
        <Grid><Row><div className="header fix-width">
          <Col xs={6}>
            <span className="fa fa-plus header-button dragholl"
              onClick={::this.handlePlus}
            />
          </Col>
          <Col xs={6}><div className="remove-icon">
            <span className="fa fa-remove pull-right header-button dragholl"
              onClick={::this.handleRemove}
            />
          </div></Col>
        </div></Row></Grid>
        <div className="body fix-height">
          <textarea id="editor" className="fix-width fix-height"
            style={textareaStyle}
            value={this.state.content}
            onChange={::this.handleChange}
            onBlur={::this.handleBlur}
          />
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Post />, document.getElementById('container'));
