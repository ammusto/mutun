import React from 'react';

const About: React.FC = () => {
  return (
    <div className="container">
      <div className='text-content'>
        <h2>About The Project</h2>
        <p>The impetus behind this project grew out of frustration with the lack of any user-friendly way of accessing thousands of digitized texts in the KITAB/OpenITI project collected years ago. The majority of researchers, scholars, and readers don't have the technical knowledge to access let alone read and search these highly encoded texts. Mutūn is an answer to this problem by providing access to thousands of texts, many of which are not available in searchable corpora. Not only can users easily perform basic searches for words or phrases, but they can also save custom collections, past searches, and carry out complex queries that utilize both regular token search and root search.</p>
        <p></p>
        <h2>Recent Updates</h2>
        <ul>
          <li>Mutūn is up for testing</li>
        </ul>
        <h2>Known Issues</h2>
        <ul>
          <li></li>
        </ul>
        <h2>To-Do List</h2>
        <ul>
          <li>More Robust Metadata Filtering</li>
          <li>Search Page Loading Performance Issues</li>
        </ul>
        <h2>Acknowledgements</h2>
        <p>Initital funding for this project was won through NYU's Faculty Digital Humanities Seed Grant. I would also like to thank Jeremy Farrell, Giovanni DiRusso, and Muhammed AbuOdeh members of the nuṣūṣ team for their assistance, feedback, and support in conceiving of this project.</p>
        <h2>About Me</h2>
        <p>My name is Antonio Musto, and I'm a Postdoctoral Visiting Lecturer at NYU, having received my Ph.D. in 2024 from the Middle Eastern and Islamic Studies department. You can learn more about my work at <a href='https://www.antoniomusto.com'>my website</a>, my <a href="https://nyu.academia.edu/AntonioMusto">academia.edu</a> profile, and my <a href="https://github.com/ammusto">github</a>. You can also follow me on twitter <a href="https://x.com/deepcutiqtibas">@deepcutiqtibas</a>.</p>
      </div>
    </div>
  );
};
export default About;