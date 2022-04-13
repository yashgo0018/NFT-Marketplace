function Paginator({ totalPages, currentPage, setCurrentPage }) {
    if (totalPages < 2) return <></>
    return <div className="pagination">
        {currentPage === 1 || <button className="but but-left" onClick={() => setCurrentPage(currentPage - 1)}>
            <svg
                className="icon"
                xmlns="http://www.w3.org/2000/svg"
                width="192"
                height="192"
                fill="#000000"
                viewBox="0 0 256 256"
            >
                <polyline
                    points="160 208 80 128 160 48"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="24"
                ></polyline>
            </svg>
        </button>}
        {[...Array(totalPages).keys()].map((i) => (
            <button onClick={() => setCurrentPage(i + 1)} style={{ background: 'none', border: 'none' }}>
                <span
                    className={"pg-no" + (i === currentPage - 1 ? " pg-active" : "")}>
                    {i + 1}
                </span>
            </button>
        ))}
        {currentPage === totalPages || <button className="but but-right" onClick={() => setCurrentPage(currentPage + 1)}>
            <svg
                className="icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 256 256"
            >
                <polyline
                    points="96 48 176 128 96 208"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="24"
                ></polyline>
            </svg>
        </button>}
    </div>;
}

export default Paginator;