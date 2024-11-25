import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer>
      <div className="div-footer">
        <div className="footer-link-container">
          <a href="mailto:nususcorpus@gmail.com">Contact Us</a>
          <a href="https://github.com/ammusto/nusus-static">
            <img id="git_footer" src="/media/github-mark.png" alt="GitHub" />
          </a>
          <a href="mailto:nususcorpus@gmail.com">Report a Bug</a>
        </div>
        <div>
          © Antonio Musto 2022
        </div>
      </div>
    </footer>
  );
};

export default Footer;