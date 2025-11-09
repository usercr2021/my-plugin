import React, { useState, useRef, useEffect } from 'react';
import './InsertableSelect.css'; // 样式文件

interface Option {
  value: string;
  label: string;
}

interface InsertableSelectProps {
  options: Option[]; // 预设选项列表
  placeholder?: string; // 输入框占位符
  onChange?: (value: string) => void; // 值变化回调
  defaultValue?: string; // 默认值
  maxOptions?: number; // 最大显示选项数
}

const InsertableSelect: React.FC<InsertableSelectProps> = ({
  options,
  placeholder = '请输入或选择...',
  onChange,
  defaultValue = '',
  maxOptions = 8,
}) => {
  const [inputValue, setInputValue] = useState(defaultValue); // 输入框当前值
  const [filteredOptions, setFilteredOptions] = useState<Option[]>(options); // 过滤后的选项
  const [isOpen, setIsOpen] = useState(false); // 下拉菜单是否展开
  const [highlightedIndex, setHighlightedIndex] = useState(-1); // 高亮的选项索引
  const wrapperRef = useRef<HTMLDivElement>(null); // 组件容器引用

  // 过滤选项（根据输入值匹配）
  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredOptions(options.slice(0, maxOptions));
      setHighlightedIndex(-1);
      return;
    }

    // 匹配选项的label或value（不区分大小写）
    const filtered = options.filter(option => 
      option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
      option.value.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredOptions(filtered.slice(0, maxOptions));
    setHighlightedIndex(-1);
  }, [inputValue, options, maxOptions]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 处理输入框变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsOpen(true); // 输入时自动展开下拉
    onChange?.(value);
  };

  // 选择下拉选项
  const handleOptionSelect = (option: Option) => {
    setInputValue(option.value);
    setIsOpen(false);
    onChange?.(option.value);
  };

  // 处理键盘事件（支持上下箭头选择和回车确认）
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    // 上箭头
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev <= 0 ? filteredOptions.length - 1 : prev - 1
      );
    }

    // 下箭头
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev >= filteredOptions.length - 1 ? 0 : prev + 1
      );
    }

    // 回车确认
    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
        handleOptionSelect(filteredOptions[highlightedIndex]);
      }
    }

    // ESC关闭
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // 手动添加新选项（输入值不在预设选项中时）
  const handleAddNew = () => {
    if (inputValue.trim() && !options.some(opt => opt.value === inputValue.trim())) {
      // 实际应用中可能需要调用接口添加到数据源
      setInputValue(inputValue.trim());
      onChange?.(inputValue.trim());
      setIsOpen(false);
    }
  };

  return (
    <div className="insertable-select" ref={wrapperRef}>
      {/* 输入框 */}
      <div className="select-input-wrapper">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="select-input"
          onClick={() => setIsOpen(!isOpen)}
        />
        <span 
          className="toggle-icon" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? '▲' : '▼'}
        </span>
      </div>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="options-dropdown">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={option.value}
                className={`option-item ${index === highlightedIndex ? 'highlighted' : ''}`}
                onClick={() => handleOptionSelect(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {option.label}
                <span className="option-value">({option.value})</span>
              </div>
            ))
          ) : (
            <div className="no-options">
              无匹配选项
              {inputValue.trim() && (
                <button 
                  className="add-new-btn" 
                  onClick={handleAddNew}
                >
                  + 添加 "{inputValue}"
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InsertableSelect;