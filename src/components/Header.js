import PropTypes from 'prop-types';

const Header = ({ title }) => {
    return (
        <center><h1 className='Header'>{title}</h1></center>
    )
};

Header.defaultProps = {
  title: 'Queen\'s University Contract Bridge Club',
};

Header.propTypes = {
  title: PropTypes.string.isRequired,
};

export default Header;