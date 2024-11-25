const SearchResultsSkeleton = () => {
    const loadingRows = Array(20).fill(null);

    return (
        <div>
            <div className="results-header">
                <div className="flex gap-4 items-center results-split">
                    <div className="skeleton-table-item" />
                    <div className="skeleton-table-item" />

                </div>
            </div>

            <table className='results-table'>
                <thead>
                    <tr>
                        <th>Page:Volume</th>
                        <th>Preview</th>
                        <th>Text</th>
                    </tr>
                </thead>
                <tbody>
                    {loadingRows.map((_, index) => (
                        <tr key={index}>
                            <td className="skeleton-td">
                                <div className="skeleton-table-item" />
                            </td>
                            <td className="skeleton-td">
                                <div className="result-preview-container">
                                    <ul className="result-preview">
                                        <li className="skeleton-table-item" />
                                        <li className="skeleton-table-item" />
                                    </ul>
                                </div>
                            </td>
                            <td className="">
                                <div className="skeleton-table-item fl-r" />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div >
    );
};

export default SearchResultsSkeleton;