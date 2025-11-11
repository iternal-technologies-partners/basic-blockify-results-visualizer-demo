import React, { useState, useEffect } from 'react';
import Select from 'react-select';

const CustomSelect = ({ options, isMulti, selectedOptions, handleChange }) => {
	const [isDarkMode, setIsDarkMode] = useState(false);

	// detect and apply changes in case system colorScheme is updated
	useEffect(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		setIsDarkMode(mediaQuery.matches);

		const handleChangeColorScheme = (e) => {
			setIsDarkMode(e.matches);
		};

		mediaQuery.addEventListener('change', handleChangeColorScheme);
		return () =>
			mediaQuery.removeEventListener('change', handleChangeColorScheme);
	}, []);

	// custom styles based on dark/light Mode
	const customSelectStyles = {
		control: (provided, state) => ({
			...provided,
			backgroundColor: isDarkMode
				? 'var(--dark-mode-background)'
				: 'var(--light-mode-background)',
			color: isDarkMode
				? 'var(--dark-mode-texture)'
				: 'var(--light-mode-texture)',
			borderRadius: '0.375rem',
			borderColor: state.isFocused
				? isDarkMode
					? 'var(--dark-mode-border)'
					: 'var(--light-mode-border)'
				: isDarkMode
				? 'var(--dark-mode-border)'
				: 'var(--light-mode-border)',
			':hover': {
				borderColor: state.isFocused
					? isDarkMode
						? 'var(--dark-mode-border)'
						: 'var(--light-mode-border)'
					: isDarkMode
					? 'var(--dark-mode-border)'
					: 'var(--light-mode-border)',
			},
		}),
		menu: (provided) => ({
			...provided,
			backgroundColor: isDarkMode
				? 'rgba(255, 255, 255, 0.3)'
				: 'rgba(0, 0, 0, 0.3)',
			color: isDarkMode
				? 'var(--dark-mode-texture)'
				: 'var(--light-mode-texture)',
			borderRadius: '0.375rem',
			borderColor: isDarkMode
				? 'var(--dark-mode-border)'
				: 'var(--light-mode-border)',
			boxShadow: isDarkMode
				? '0 0px 1px rgb(255, 255, 255)'
				: '0 0px 1px rgb(0, 0, 0)',
		}),
		option: (provided, state) => ({
			...provided,
			backgroundColor: state.isSelected
				? isDarkMode
					? 'var(--dark-mode-highlight)'
					: 'var(--light-mode-highlight)'
				: isDarkMode
				? 'var(--dark-mode-background)'
				: 'var(--light-mode-background)',
			color: state.isSelected
				? 'white'
				: isDarkMode
				? 'var(--dark-mode-texture)'
				: 'var(--light-mode-texture)',
			':hover': {
				color: isDarkMode
					? 'var(--dark-mode-highlight)'
					: 'var(--light-mode-highlight)',
			},
			borderBottom: isDarkMode
				? '1px solid rgba(255, 255, 255, 0.3)'
				: '1px solid rgba(0, 0, 0, 0.3)',
		}),
		multiValue: (provided) => ({
			...provided,
			backgroundColor: isDarkMode
				? 'var(--dark-mode-highlight)'
				: 'var(--light-mode-highlight)',
		}),
		multiValueLabel: (provided) => ({
			...provided,
			color: isDarkMode
				? 'var(--light-mode-background)'
				: 'var(--light-mode-background)',
		}),
		multiValueRemove: (provided) => ({
			...provided,
			color: isDarkMode
				? 'var(--light-mode-background)'
				: 'var(--light-mode-background)',
			':hover': {
				color: 'var(--dark-mode-background)',
			},
		}),
	};

	return (
		<div className="w-full">
			<Select
				options={options}
				isMulti={isMulti}
				value={selectedOptions}
				onChange={handleChange}
				styles={customSelectStyles}
			/>
		</div>
	);
};

export default CustomSelect;
