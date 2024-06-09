class Calculator {
	_firstInput;
	_secondInput;
	_result;

	_firstParsed;
	_secondParsed;

	constructor(firstInput, secondInput, result) {
		if (this.constructor === Calculator)
			throw new Error(`Abstract class ${this.constructor.name} can't be instantiated`);
		this._firstInput = firstInput;
		this._secondInput = secondInput;
		this._result = result;
	}

	execute() {
		if (this._isValidate())
			this._result.textContent = this._calculate().toLocaleString('ru-RU', { maximumFractionDigits: 20 });
		else
			this._result.textContent = this._msgErr();
		this._removeOpacity();
	}

	_isValidate() {
		this._firstParsed = parseFloat(this._firstInput.value);
		this._secondParsed = parseFloat(this._secondInput.value);
		return !(Number.isNaN(this._firstParsed) || Number.isNaN(this._secondParsed));
	}

	_calculate() {
		throw new Error(`Abstract method ${this._calculate.name} is not implemented`);
	}

	_msgErr() {
		return '¯\\_(ツ)_/¯';
	}

	_removeOpacity() {
		this._result.classList.remove('_hide');
	}
}

class FractionReducer extends Calculator {
	#denominatorResult;

	constructor(numerator, denominator, numeratorResult, denominatorResult) {
		super(numerator, denominator, numeratorResult);
		this.#denominatorResult = denominatorResult;
	}

	_calculate() {
		const g = this.#gcd();
		this.#denominatorResult.textContent = (this._secondParsed / g)
			.toLocaleString('ru-RU', { maximumFractionDigits: 20 });
		return this._firstParsed / g;
	}

	_msgErr() {
		this.#denominatorResult.textContent = 'не знаю';
		return super._msgErr();
	}

	_removeOpacity() {
		super._removeOpacity();
		this.#denominatorResult.classList.remove('_hide');
	}

	#gcd() {
		let g = this._firstParsed;
		let mod = this._secondParsed;

		while (mod !== 0)
			[g, mod] = [mod, g % mod];

		return g;
	}
}

class PercentPartFinder extends Calculator {
	_label;
	_switchButton;

	constructor(numerator, denominator, numeratorResult, label, switchButton) {
		super(numerator, denominator, numeratorResult);
		this._label = label;
		this._switchButton = switchButton;
	}

	_calculate() {
		return this._firstParsed * this._secondParsed / 100;
	}

	switchCalc() {
		this._switchButton.style.backgroundColor = 'red';
		this._label.classList.add('_hide');
		setTimeout(() => {
			this._label.textContent = '%';
			this._label.classList.remove('_hide');
		}, 500);
	}
}

class PercentFinder extends PercentPartFinder {
	_calculate() {
		return `${this._firstParsed * 100 / this._secondParsed}%`;
	}

	switchCalc() {
		this._switchButton.style.backgroundColor = 'lime';
		this._label.classList.add('_hide');
		setTimeout(() => {
			this._label.textContent = 'ч';
			this._label.classList.remove('_hide');
		}, 500);
	}
}

class PowRaiser extends Calculator {
	_calculate() {
		return this._firstParsed ** this._secondParsed;
	}
}

class RootTaker extends Calculator {
	_calculate() {
		return this._secondParsed ** (1 / this._firstParsed);
	}

	_isValidate() {
		this._firstParsed = parseFloat(this._firstInput.value);
		if (Number.isNaN(this._firstParsed))
			this._firstParsed = 2;

		this._secondParsed = parseFloat(this._secondInput.value);
		return !Number.isNaN(this._secondParsed);
	}
}

class LogFinder extends Calculator {
	_calculate() {
		return Math.log(this._secondParsed) / Math.log(this._firstParsed);
	}

	_isValidate() {
		this._firstParsed = parseFloat(this._firstInput.value);
		if (Number.isNaN(this._firstParsed))
			this._firstParsed = Math.E;

		this._secondParsed = parseFloat(this._secondInput.value);
		return !Number.isNaN(this._secondParsed);
	}
}

const percentLabel = document.querySelector('.percent__label');
const switchPercent = document.querySelector('.percent__switch');

const inputs = document.querySelectorAll('.number-input input, .mini-input input');
const results = document.querySelectorAll('.result');

let percentCalcToSwitch = new PercentFinder(inputs[2], inputs[3], results[2], percentLabel, switchPercent);

const calculators = [
	new FractionReducer(inputs[0], inputs[1], results[0], results[1]),
	new PercentPartFinder(inputs[2], inputs[3], results[2], percentLabel, switchPercent),
	new PowRaiser(inputs[4], inputs[5], results[3]),
	new RootTaker(inputs[6], inputs[7], results[4]),
	new LogFinder(inputs[8], inputs[9], results[5]),
];

for (const input of inputs)
	input.onfocus = e => e.target.select();

switchPercent.onclick = () => {
	percentCalcToSwitch.switchCalc();
	[calculators[1], percentCalcToSwitch] = [percentCalcToSwitch, calculators[1]];
};

document.querySelector('.buttons__calculate button').onclick = e => {
	for (const result of results)
		result.classList.add('_hide');

	for (let i = 0; i < calculators.length; i++)
		setTimeout(() => calculators[i].execute(), 500 * (i + 1));

	e.target.classList.add('_animate');
	setTimeout(() => e.target.classList.remove('_animate'), 1500);
};

document.querySelector('.buttons__reset button').onclick = e => {
	e.target.classList.add('_animate');
	for (const input of inputs)
		input.classList.add('_hide');
	setTimeout(() => {
		e.target.classList.remove('_animate');
		for (const input of inputs) {
			input.value = '';
			input.classList.remove('_hide');
		}
	}, 500);
};
