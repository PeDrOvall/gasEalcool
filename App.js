import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, Modal, TextInput, AsyncStorage } from 'react-native';

class FuelCalculatorScreen extends Component {
  render() {
    return (
      <View style={styles.entrarContainer}>
        <Text style={styles.entrarTitle}>Bem-vindo!</Text>
        <Text style={styles.entrarSubTitle}>Calcule o Combustível Ideal</Text>
        <TextInput
          style={styles.input}
          placeholder="Preço do Álcool (ex: 3,50)"
          keyboardType="numeric"
          value={this.props.alcoholPriceInput}
          onChangeText={this.props.onAlcoholPriceChange}
        />
        <TextInput
          style={styles.input}
          placeholder="Preço da Gasolina (ex: 5,00)"
          keyboardType="numeric"
          value={this.props.gasolinePriceInput}
          onChangeText={this.props.onGasolinePriceChange}
        />
        <Button
          title="Calcular"
          onPress={this.props.onCalculate}
          color="#64b5f6"
          style={{ marginBottom: 15 }}
        />
        <Button
          title="Fechar"
          onPress={this.props.onClose}
          color="#e57373"
        />
      </View>
    );
  }
}

class MainApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalVisible: false,
      alcoholPriceInput: '',
      gasolinePriceInput: '',
      calculationResult: '',
      calculationHistory: [],
    };

    this.showCalculatorScreen = this.showCalculatorScreen.bind(this);
    this.hideCalculatorScreen = this.hideCalculatorScreen.bind(this);
    this.performCalculation = this.performCalculation.bind(this);
    this.loadCalculationHistory = this.loadCalculationHistory.bind(this);
    this.handleAlcoholPriceChange = this.handleAlcoholPriceChange.bind(this);
    this.handleGasolinePriceChange = this.handleGasolinePriceChange.bind(this);
  }

  componentDidMount() {
    this.loadCalculationHistory();
  }

  showCalculatorScreen() {
    this.setState({ isModalVisible: true });
  }

  hideCalculatorScreen() {
    this.setState({ isModalVisible: false });
  }

  handleAlcoholPriceChange(text) {
    this.setState({ alcoholPriceInput: text });
  }

  handleGasolinePriceChange(text) {
    this.setState({ gasolinePriceInput: text });
  }

  async performCalculation() {
    const { alcoholPriceInput, gasolinePriceInput } = this.state;

    if (!alcoholPriceInput || !gasolinePriceInput) {
      this.setState({ calculationResult: 'Preencha os dois valores!' });
      return;
    }

    const alcoholPrice = parseFloat(alcoholPriceInput.replace(',', '.'));
    const gasolinePrice = parseFloat(gasolinePriceInput.replace(',', '.'));

    if (isNaN(alcoholPrice) || isNaN(gasolinePrice)) {
      this.setState({ calculationResult: 'Valores inválidos. Use números e vírgula ou ponto.' });
      return;
    }

    const calculation = alcoholPrice / gasolinePrice;
    const recommendation = calculation < 0.7 ? 'Álcool' : 'Gasolina';
    const resultText = `Álcool: R$${alcoholPrice.toFixed(2)}, Gasolina: R$${gasolinePrice.toFixed(2)}. Abasteça com: ${recommendation}`;

    this.setState({ calculationResult: resultText }, () => {
      this.saveCalculationToHistory(resultText);
    });
  }

  async saveCalculationToHistory(result) {
    try {
      const storedHistory = await AsyncStorage.getItem('fuelCalculationHistory');
      let historyArray = storedHistory ? JSON.parse(storedHistory) : [];
      historyArray.push(result);
      await AsyncStorage.setItem('fuelCalculationHistory', JSON.stringify(historyArray));
      this.setState({ calculationHistory: historyArray }, this.loadCalculationHistory);
    } catch (error) {
      console.error("Erro ao salvar o histórico:", error);
    }
  }

  async loadCalculationHistory() {
    try {
      const storedHistory = await AsyncStorage.getItem('fuelCalculationHistory');
      if (storedHistory) {
        this.setState({ calculationHistory: JSON.parse(storedHistory) });
      }
    } catch (error) {
      console.error("Erro ao carregar o histórico:", error);
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>App Combustível</Text>
        <Text style={styles.subtitle}>
          Descubra a melhor opção para o seu bolso!
        </Text>

        <Button title="Calcular Combustível" onPress={this.showCalculatorScreen} color="#00b0ff"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.8,
            shadowRadius: 5,
            elevation: 5,
          }}
        />

        <Modal
          animationType="slide"
          visible={this.state.isModalVisible}
          transparent={true}
          onRequestClose={() => this.hideCalculatorScreen()}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <FuelCalculatorScreen
                onClose={this.hideCalculatorScreen}
                onCalculate={() => {
                  this.performCalculation();
                  this.hideCalculatorScreen();
                }}
                alcoholPriceInput={this.state.alcoholPriceInput}
                gasolinePriceInput={this.state.gasolinePriceInput}
                onAlcoholPriceChange={this.handleAlcoholPriceChange}
                onGasolinePriceChange={this.handleGasolinePriceChange}
              />
            </View>
          </View>
        </Modal>

        {this.state.calculationResult ? (
          <Text style={styles.resultText}>{this.state.calculationResult}</Text>
        ) : null}

        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Histórico de Cálculos:</Text>
          {this.state.calculationHistory.length > 0 ? (
            this.state.calculationHistory.map((item, index) => (
              <Text key={index} style={styles.historyItem}>{item}</Text>
            ))
          ) : (
            <Text style={styles.historyEmpty}>Nenhum cálculo realizado.</Text>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0c192c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    marginBottom: 20,
    color: '#64b5f6',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 24,
    marginBottom: 30,
    color: '#b0bec5',
    fontFamily: 'monospace',
    fontWeight: 'normal',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '95%',
    backgroundColor: '#1a2a3c',
    borderRadius: 10,
    padding: 30,
    elevation: 15,
    borderWidth: 2,
    borderColor: '#4fc3f7',
  },
  entrarContainer: {
    padding: 30,
    alignItems: 'center',
  },
  entrarTitle: {
    color: '#64b5f6',
    fontSize: 32,
    marginBottom: 20,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  entrarSubTitle: {
    color: '#b0bec5',
    fontSize: 20,
    marginBottom: 30,
    fontFamily: 'monospace',
    fontWeight: 'normal',
    letterSpacing: 1,
  },
  input: {
    height: 60,
    marginVertical: 15,
    padding: 20,
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'monospace',
    borderColor: '#4fc3f7',
    placeholderTextColor: 'rgba(176, 190, 197, 0.5)',
  },
  resultText: {
    marginTop: 30,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff6e40',
    textAlign: 'center',
    fontFamily: 'monospace',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  historyContainer: {
    marginTop: 40,
    width: '100%',
    alignItems: 'center',
  },
  historyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#64b5f6',
    marginBottom: 20,
    fontFamily: 'monospace',
    letterSpacing: 2,
    borderBottomWidth: 2,
    borderBottomColor: '#4fc3f7',
    paddingBottom: 10,
  },
  historyItem: {
    fontSize: 20,
    color: '#ffffff',
    marginVertical: 8,
    fontFamily: 'monospace',
    letterSpacing: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(79, 195, 247, 0.3)',
  },
  historyEmpty: {
    fontSize: 20,
    color: '#b0bec5',
    fontStyle: 'italic',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MainApp;cd