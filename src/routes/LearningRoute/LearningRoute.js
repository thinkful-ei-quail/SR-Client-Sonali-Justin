import React, { Component } from 'react'
import './LearningRoute.css'
import WordApiService from '../../services/word-api-service'
import AnswerResults from '../../components/AnswerResult/AnswerResult'

class LearningRoute extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentWord: {},
      didSubmit: false,
      rightAnswer: '',
      userAnswer: '',
      isCorrect: null,
      totalScore: 0,
      newScore: 0,
      error: null
    }
  }

  getHead() {
    WordApiService.getHead()
      .then(res => {
        if (!res.ok) {
          Promise.reject(res.error)
        }
        return res.json();
      })
      .then(res => {
        this.setState({ currentWord: res });
      })
      .catch(error => this.setState({error}));
  }

  componentDidMount() {
    return this.getHead()
  }

  handleSubmit = ev => {
    ev.preventDefault();
    let { guess } = ev.target;
    guess = guess.value;
    WordApiService.postGuess(guess, this.state.currentWord.id)
      .then(res => res.json())
      .then(res => {
        this.setState({
          isCorrect: res.isCorrect,
          userAnswer: guess,
          rightAnswer: res.answer,
          didSubmit: true,
          totalScore: res.totalScore,
          newScore: res.totalScore
        })
      })
      .catch(error => this.setState({error}));
  }

  handleNextTryClick = () => {
    this.setState({
      didSubmit: false,
      isCorrect: null,
    })
    return this.getHead();
  }

  render() {
    let currentWord = this.state.currentWord.nextWord || '';

    let translation = this.state.didSubmit ? this.state.rightAnswer : '';
    let userGuess = this.state.didSubmit
      ? <span className={this.state.isCorrect ? 'greenTea' : 'strawberry'}>{this.state.userAnswer}</span>
      : '';
    let totalScore = this.state.newScore || this.state.currentWord.totalScore ;
    let correctlyAnswered = this.state.currentWord ? this.state.currentWord.wordCorrectCount : '';
    let incorrectlyAnswered = this.state.currentWord ? this.state.currentWord.wordIncorrectCount : '';
    let submissionFeedback = this.state.isCorrect
      ? <h2 className='greenTea'>You were correct! :D</h2>
      : <h2 className='strawberry'>Good try, but not quite right :(</h2>;
    let heading = this.state.didSubmit ? submissionFeedback : <h2 >Translate the word:</h2>
    let displayForm = this.state.didSubmit
      ? <AnswerResults
        userGuess={userGuess}
        translation={translation}
        totalScore={totalScore}
        handleNextTryClick={this.handleNextTryClick}
        currentWord={currentWord}
        isCorrect={this.state.isCorrect}
      />
      : (<form onSubmit={this.handleSubmit} >
        <fieldset className={`GuessForm`}>
          <legend className='legend'>Guess Submission</legend>
          <label htmlFor='learn-guess-input'>What's the translation for this word?</label><br />
          <input id='learn-guess-input' name='guess' type='text' required></input><br />
          <button type='submit' className='submit'>Submit your answer</button>
        </fieldset>
      </form>);

    return (
      <section className='LearningDisplay '>
        <section className='wordCard LearningTitle'>
          {heading}
          <span className='currentWord' lang="ja" >{currentWord}</span>
          <p className='DisplayScore'>Your total score is: {totalScore}</p>
        </section>

        {displayForm}
        <section className='Scores'>
          <p>You have answered this word correctly {correctlyAnswered} times.</p>
          <p>You have answered this word incorrectly {incorrectlyAnswered} times.</p>
        </section>
      </section>
    );
  }
}

export default LearningRoute
