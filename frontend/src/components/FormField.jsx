const FormField = ({ id, label, type, Icon, placeholder, value, onChange, required = true, className = "" }) => (
	<div className={className}>
		<label htmlFor={id} className='block text-sm font-medium text-white/80'>
			{label}
		</label>
		<div className='relative mt-1 rounded-md shadow-sm'>
			<div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
				<Icon className='h-5 w-5 text-white/50' aria-hidden='true' />
			</div>
			<input
				id={id}
				type={type}
				required={required}
				value={value}
				onChange={onChange}
				className='block w-full rounded-xl border border-payzone-indigo/40 bg-payzone-navy/60 px-3 py-2 pr-10 text-white placeholder-white/40 focus:border-payzone-gold focus:outline-none focus:ring-2 focus:ring-payzone-indigo sm:text-sm'
				placeholder={placeholder}
			/>
		</div>
	</div>
);

export default FormField;
