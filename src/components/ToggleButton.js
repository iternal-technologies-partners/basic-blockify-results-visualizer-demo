import React, { useState, useEffect } from 'react';

const ToggleButton = ({ onLabel, offLabel, toggleState, handleChange }) => {
	const [isToggled, setIsToggled] = useState(toggleState);

	const handleToggle = (e) => {
		setIsToggled(e.target.checked);
		handleChange(e);
	};

	return (
		<div className="flex items-center">
			<label
				htmlFor="toggle"
				className={`flex items-center cursor-pointer ${
					isToggled
						? 'bg-light-mode-highlight/70 dark:bg-dark-mode-highlight/70'
						: 'bg-gray-400'
				} rounded-full w-8 h-4 transition-all duration-300`}
			>
				<div
					className={` dark:bg-dark-mode-highlight w-5 h-5 rounded-full ${
						isToggled
							? 'shadow bg-light-mode-highlight dark:bg-dark-mode-highlight transform translate-x-4'
							: 'border bg-white dark:bg-white  transform -translate-x-0.5'
					} transition-transform duration-300`}
				/>
			</label>
			<input
				type="checkbox"
				id="toggle"
				className="hidden"
				value={isToggled}
				onChange={handleToggle}
			/>
			<span className="input-checkbox-label pl-3 ">
				{isToggled ? onLabel : offLabel}
			</span>
		</div>
	);
};

export default ToggleButton;
