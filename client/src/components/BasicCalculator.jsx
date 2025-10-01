import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './BasicCalculator.module.css';

const BasicCalculator = () => {
  const navigate = useNavigate();
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const inputNumber = (num) => {
    if (waitingForNewValue) {
      setDisplay(String(num));
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue, secondValue, operation) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '*':
        return firstValue * secondValue;
      case '/':
        return firstValue / secondValue;
      default:
        return secondValue;
    }
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const handlePercentage = () => {
    const currentValue = parseFloat(display);
    setDisplay(String(currentValue / 100));
  };

  const handleToggleSign = () => {
    const value = parseFloat(display);
    setDisplay(String(-value));
  };


  //SOPORTE DE TECLADO
 useEffect(() => {
  const handleKeyPress = (event) => {
    const key = event.key;
    
    // Solo procesar si es una tecla de calculadora
    if ('0123456789+-*/.=EnterEscapeDeleteBackspace'.includes(key)) {
      event.preventDefault(); // Evita comportamientos por defecto
      
      if (key >= '0' && key <= '9') {
        inputNumber(parseInt(key));
        return;
      }
      
      switch (key) {
        case '+': performOperation('+'); break;
        case '-': performOperation('-'); break;
        case '*': performOperation('*'); break;
        case '/': performOperation('/'); break;
        case '.': inputDecimal(); break;
        case '=':
        case 'Enter': 
          handleEquals(); 
          break;
        case 'Escape':
        case 'Delete': 
          clear(); 
          break;
        case 'Backspace':
          setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
          break;
      }
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [display, waitingForNewValue]);


  return (
    <div className={styles.calculatorPage}>
      <div className={styles.calculatorHeader}>
        <h2>Calculadora Básica</h2>        
      </div>

      <div className={styles.calculatorContainer}>
        {/* QUITAR el overlay y modal - usar styles */}
        <div className={styles.calculator}>
          <div className={styles.calculatorDisplay}>{display}</div>
          
          <div className={styles.calculatorButtons}>
            <button className={styles.btnClear} onClick={clear}>C</button>
            <button className={styles.btnOperation} onClick={handleToggleSign}>±</button>
            <button className={styles.btnOperation} onClick={handlePercentage}>%</button>
            <button className={styles.btnOperation} onClick={() => performOperation('/')}>/</button>

            {/* ... todos los botones igual pero con styles */}
            <button className={styles.btnNumber} onClick={() => inputNumber(7)}>7</button>
            <button className={styles.btnNumber} onClick={() => inputNumber(8)}>8</button>
            <button className={styles.btnNumber} onClick={() => inputNumber(9)}>9</button>
            <button className={styles.btnOperation} onClick={() => performOperation('*')}>×</button>

            <button className={styles.btnNumber} onClick={() => inputNumber(4)}>4</button>
            <button className={styles.btnNumber} onClick={() => inputNumber(5)}>5</button>
            <button className={styles.btnNumber} onClick={() => inputNumber(6)}>6</button>
            <button className={styles.btnOperation} onClick={() => performOperation('-')}>-</button>

            <button className={styles.btnNumber} onClick={() => inputNumber(1)}>1</button>
            <button className={styles.btnNumber} onClick={() => inputNumber(2)}>2</button>
            <button className={styles.btnNumber} onClick={() => inputNumber(3)}>3</button>
            <button className={styles.btnOperation} onClick={() => performOperation('+')}>+</button>

            <button className={styles.btnZero} onClick={() => inputNumber(0)}>0</button>
            <button className={styles.btnNumber} onClick={inputDecimal}>.</button>
            <button className={styles.btnEquals} onClick={handleEquals}>=</button>
          </div>
        </div>
      </div>

      <div className={styles.calculatorFooter}>
        <button 
          onClick={() => navigate('/dashboard', { state: { activeTab: 'inicio' } })}
          className={styles.backButton}
        >
          Volver
        </button>
      </div>
    </div>
  );
};

export default BasicCalculator;