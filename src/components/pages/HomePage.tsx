import React from 'react';
const HomePage: React.FC = () => {

  return (
    <div className='container'>
      <div className='text-content'>
        <h2>A Searchable Meta-Corpus</h2>
        <p>
          The mutūn project looks to empower non-technical users by facilitating access to thousands of digitized Arabic texts. Building off of the pioneering work of the Open Islamic Texts Initiative (<a href="https://openiti.org/">OpenITI</a>) and the <a href="https://kitab-project.org/">KITAB</a> project in collecting and curating a meta-corpus of over 10,000 unique Arabic texts, mutūn will allow users to create their own subcorpora of digitized Arabic texts through an accessible platform. Furthermore, a wide array of computational tools have been developed for the textual analysis of Arabic texts, including the toolset created by NYU Abu Dhabi's <a href="https://nyuad.nyu.edu/en/research/faculty-labs-and-projects/computational-approaches-to-modeling-language-lab.html">CAMeL Lab</a>. Without technical training, the contributions of these and other projects remain out of reach to the lay researcher. The mutūn platform looks to change that by enabling any user to: easily access and read these digitized texts; organize their own corpus; carry out complex searches; and view text analysis outputs of their corpora to further their research goals.
        </p>
        <p>
          Currently in it's alpha stage, only the search capabilities of mutūn are available. This includes the ability to search by token (i.e. word), phrase, or root. Additionally, you can perform a proximity search between tokens or roots. For example, you can find all instances where the term معرفة appears within, say, 5 words of الله. Or, if you want to increase the scope of your search, you can find all instances where a word whose root is عرف appears within 5 tokens of the word الله.
        </p>
        <h2>Corpus Stats</h2>
        <ul className='corpus-stats'>
          <li><strong>Texts</strong>: 10,290</li>
          <li><strong>Authors</strong>: 3,758</li>
          <li><strong>Words</strong>: 1,389,738,991</li>
          <li><strong>Pages</strong>: 7,591,681</li>
        </ul>
      </div>
    </div>
  );
};
export default HomePage;
